"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";
import type { User } from "./user";
import { programToCollege } from "@/app/component/General/Announcement/Utils/constants";

export interface NotificationItem {
  id: string;
  title: string;
  created_at: string;
  visibility: string | null;
  type: "announcement" | "system";
  redirect_url?: string;
}

export function useNotifications(user: User | null) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [lastReadAt, setLastReadAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userId = user?.id;

  const getUserCollegeCode = useCallback(() => {
    if (!user?.course) return null;
    const courseSlug = user.course.toLowerCase();
    if (programToCollege[courseSlug]) return programToCollege[courseSlug];
    if (Object.values(programToCollege).includes(courseSlug)) return courseSlug;
    return null;
  }, [user]);

  const userCollegeCode = getUserCollegeCode();

  const fetchLastReadStatus = useCallback(async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from("NotificationStatus")
      .select("last_read_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) {
      setLastReadAt(data.last_read_at);
    } else {
      setLastReadAt(null); 
    }
  }, [userId]);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    
    // Optional: Comment out setIsLoading(true) if you don't want the loading spinner 
    // to flash on every single realtime update.
    // setIsLoading(true); 

    try {
      // 1. Fetch Announcements (Increased limit to 50 to prevent disappearing items)
      let announcementQuery = supabase
        .from("Posts")
        .select(`id, title, created_at, type, visibility`)
        .eq("type", "announcement")
        .order("created_at", { ascending: false })
        .limit(50); // --- FIXED: Increased limit from 10 to 50 ---

      if (userCollegeCode) {
        announcementQuery = announcementQuery.or(`visibility.eq.global,visibility.eq.${userCollegeCode},visibility.is.null`);
      } else {
        announcementQuery = announcementQuery.or(`visibility.eq.global,visibility.is.null`);
      }

      // 2. Fetch UserNotifications (New Table) (Increased limit to 50)
      const userNotifQuery = supabase
        .from("UserNotifications")
        .select(`id, title, created_at, type, is_read, redirect_url`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50); // --- FIXED: Increased limit from 10 to 50 ---

      const [announcementsRes, userNotifRes] = await Promise.all([announcementQuery, userNotifQuery]);

      if (announcementsRes.error) throw announcementsRes.error;
      if (userNotifRes.error) throw userNotifRes.error;

      // 3. Format and Merge
      const formattedAnnouncements: NotificationItem[] = (announcementsRes.data || []).map((post) => ({
        id: post.id,
        title: post.title,
        created_at: post.created_at,
        visibility: post.visibility,
        type: "announcement",
      }));

      const formattedUserNotifs: NotificationItem[] = (userNotifRes.data || []).map((notif) => ({
        id: notif.id,
        title: notif.title,
        created_at: notif.created_at,
        visibility: null,
        type: "system", 
        redirect_url: notif.redirect_url,
      }));

      // Combine and Sort by Date (Newest First)
      const combined = [...formattedAnnouncements, ...formattedUserNotifs].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotifications(combined);

      // 4. Calculate Unread Count
      // Count announcements newer than lastReadAt
      let announcementUnread = 0;
      if (lastReadAt) {
        announcementUnread = announcementsRes.data!.filter(
          (p) => new Date(p.created_at) > new Date(lastReadAt)
        ).length;
      } else {
        announcementUnread = announcementsRes.data!.length; 
      }

      // Count unread UserNotifications (using is_read column)
      const systemUnread = (userNotifRes.data || []).filter((n: any) => !n.is_read).length;

      setUnreadCount(announcementUnread + systemUnread);

    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, lastReadAt, userCollegeCode]);

  const markAsRead = async () => {
    if (!userId) return;
    const now = new Date().toISOString();
    
    // Optimistic Update
    setUnreadCount(0);
    setLastReadAt(now);

    // 1. Update Global Last Read (For announcements)
    const { error: statusError } = await supabase
      .from("NotificationStatus")
      .upsert({ user_id: userId, last_read_at: now }, { onConflict: "user_id" });

    if (statusError) console.error("Failed to mark announcements as read", statusError);

    // 2. Update UserNotifications (Set is_read = true)
    const { error: userNotifError } = await supabase
      .from("UserNotifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (userNotifError) console.error("Failed to mark system notifications as read", userNotifError);
  };

  useEffect(() => {
    fetchLastReadStatus();
  }, [fetchLastReadStatus]);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchLastReadStatus, fetchNotifications]);

  // Realtime Subscriptions
  useEffect(() => {
    if (!userId) return;

    // Listen to Announcements
    const announcementChannel = supabase
      .channel(`public:Posts:announcement-check-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Posts",
          filter: "type=eq.announcement", 
        },
        () => fetchNotifications()
      )
      .subscribe();

    // Listen to UserNotifications
    const userNotifChannel = supabase
      .channel(`public:UserNotifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // --- FIXED: Changed from "INSERT" to "*" to catch UPDATEs and DELETEs ---
          schema: "public",
          table: "UserNotifications",
          filter: `user_id=eq.${userId}`, 
        },
        () => {
          console.log("Realtime notification received!"); // Debug log
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(announcementChannel);
      supabase.removeChannel(userNotifChannel);
    };
  }, [userId, fetchNotifications]);

  return {
    unreadCount,
    notifications,
    isLoading,
    markAsRead,
  };
}
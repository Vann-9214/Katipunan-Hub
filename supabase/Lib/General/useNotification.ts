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
  // Removed 'author' field since we always display "CIT-U"
}

export function useNotifications(user: User | null) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [lastReadAt, setLastReadAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userId = user?.id;

  // 1. Resolve User's College Code
  const getUserCollegeCode = useCallback(() => {
    if (!user?.course) return null;
    const courseSlug = user.course.toLowerCase();
    if (programToCollege[courseSlug]) return programToCollege[courseSlug];
    if (Object.values(programToCollege).includes(courseSlug)) return courseSlug;
    return null;
  }, [user]);

  const userCollegeCode = getUserCollegeCode();

  // 2. Fetch the last time the user checked notifications
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

  // 3. Fetch relevant announcements and calculate count
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from("Posts")
        .select(`
          id, 
          title, 
          created_at, 
          type,
          visibility
        `)
        .eq("type", "announcement")
        .order("created_at", { ascending: false })
        .limit(10);

      // Filter by Visibility (Global OR User's College)
      if (userCollegeCode) {
        query = query.or(`visibility.eq.global,visibility.eq.${userCollegeCode},visibility.is.null`);
      } else {
        query = query.or(`visibility.eq.global,visibility.is.null`);
      }

      const { data: posts, error } = await query;

      if (error) throw error;

      // REMOVED: Author fetching logic

      const formattedNotifications: NotificationItem[] = posts.map((post) => ({
        id: post.id,
        title: post.title,
        created_at: post.created_at,
        visibility: post.visibility,
      }));

      setNotifications(formattedNotifications);

      // Calculate Unread Count
      let count = 0;
      if (lastReadAt) {
        count = posts.filter(
          (p) => new Date(p.created_at) > new Date(lastReadAt)
        ).length;
      } else {
        count = posts.length; 
      }
      setUnreadCount(count);

    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, lastReadAt, userCollegeCode]);

  // 4. Mark as Read Action
  const markAsRead = async () => {
    if (!userId) return;
    const now = new Date().toISOString();
    setUnreadCount(0);
    setLastReadAt(now);

    const { error } = await supabase
      .from("NotificationStatus")
      .upsert({ user_id: userId, last_read_at: now }, { onConflict: "user_id" });

    if (error) console.error("Failed to mark notifications as read", error);
  };

  // --- Effects ---

  useEffect(() => {
    fetchLastReadStatus();
  }, [fetchLastReadStatus]);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchLastReadStatus, fetchNotifications]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`public:Posts:announcement-check-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Posts",
          filter: "type=eq.announcement", 
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

  return {
    unreadCount,
    notifications,
    isLoading,
    markAsRead,
  };
}
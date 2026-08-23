"use client";

import { useState, useEffect, useCallback } from "react";
import type { User } from "@/database/supabase/General/user";
import { programToCollege } from "@/features/Announcement/utils/constants";
import {
  NotificationItem,
  fetchLastReadStatus,
  fetchNotificationData,
  markNotificationsAsRead,
  subscribeToNotifications,
} from "@/database/supabase/Notification";

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

  const loadLastReadStatus = useCallback(async () => {
    if (!userId) return;
    const readAt = await fetchLastReadStatus(userId);
    setLastReadAt(readAt);
  }, [userId]);

  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const { notifications: combined, announcementsData, userNotifsData } =
        await fetchNotificationData(userId, userCollegeCode);

      setNotifications(combined);

      // Calculate Unread Count
      let announcementUnread = 0;
      if (lastReadAt) {
        announcementUnread = announcementsData.filter(
          (p: any) => new Date(p.created_at) > new Date(lastReadAt)
        ).length;
      } else {
        announcementUnread = announcementsData.length;
      }

      const systemUnread = userNotifsData.filter((n: any) => !n.is_read).length;
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

    await markNotificationsAsRead(userId, now);
  };

  useEffect(() => {
    loadLastReadStatus();
  }, [loadLastReadStatus]);

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId, loadLastReadStatus, loadNotifications]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToNotifications(userId, () => {
      loadNotifications();
    });

    return () => {
      unsubscribe();
    };
  }, [userId, loadNotifications]);

  return {
    unreadCount,
    notifications,
    isLoading,
    markAsRead,
  };
}

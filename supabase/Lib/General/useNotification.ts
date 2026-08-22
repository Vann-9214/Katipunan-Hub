"use client";

import { useState } from "react";
import type { User } from "./user";
import { MOCK_NOTIFICATIONS } from "../mockData";

export interface NotificationItem {
  id: string;
  title: string;
  created_at: string;
  visibility: string | null;
  type: "announcement" | "system";
  redirect_url?: string;
}

const initialNotifs: NotificationItem[] = MOCK_NOTIFICATIONS.map((n) => ({
  id: n.id,
  title: `${n.title}: ${n.message}`,
  created_at: n.created_at,
  visibility: "Global",
  type: (n.type === "announcement" ? "announcement" : "system") as "announcement" | "system",
  redirect_url: n.type === "announcement" ? "/Announcement" : undefined,
}));

export function useNotifications(user: User | null) {
  const [unreadCount, setUnreadCount] = useState(2);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifs);
  const [isLoading, setIsLoading] = useState(false);

  const markAsRead = async () => {
    setUnreadCount(0);
  };

  return {
    unreadCount,
    notifications,
    isLoading,
    markAsRead,
  };
}
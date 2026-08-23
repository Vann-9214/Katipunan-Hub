import { supabase } from "../General/supabaseClient";
import { NotificationItem } from "./types";

export async function fetchLastReadStatus(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("NotificationStatus")
    .select("last_read_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (!error && data) {
    return data.last_read_at;
  }
  return null;
}

export async function fetchNotificationData(
  userId: string,
  userCollegeCode: string | null
): Promise<{
  notifications: NotificationItem[];
  announcementsData: any[];
  userNotifsData: any[];
}> {
  // 1. Fetch Announcements
  let announcementQuery = supabase
    .from("Posts")
    .select(`id, title, created_at, type, visibility`)
    .eq("type", "announcement")
    .order("created_at", { ascending: false })
    .limit(50);

  if (userCollegeCode) {
    announcementQuery = announcementQuery.or(
      `visibility.eq.global,visibility.eq.${userCollegeCode},visibility.is.null`
    );
  } else {
    announcementQuery = announcementQuery.or(
      `visibility.eq.global,visibility.is.null`
    );
  }

  // 2. Fetch UserNotifications
  const userNotifQuery = supabase
    .from("UserNotifications")
    .select(`id, title, created_at, type, is_read, redirect_url`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  const [announcementsRes, userNotifRes] = await Promise.all([
    announcementQuery,
    userNotifQuery,
  ]);

  if (announcementsRes.error) throw announcementsRes.error;
  if (userNotifRes.error) throw userNotifRes.error;

  const formattedAnnouncements: NotificationItem[] = (
    announcementsRes.data || []
  ).map((post) => ({
    id: post.id,
    title: post.title,
    created_at: post.created_at,
    visibility: post.visibility,
    type: "announcement",
  }));

  const formattedUserNotifs: NotificationItem[] = (
    userNotifRes.data || []
  ).map((notif) => ({
    id: notif.id,
    title: notif.title,
    created_at: notif.created_at,
    visibility: null,
    type: "system",
    redirect_url: notif.redirect_url,
  }));

  const combined = [...formattedAnnouncements, ...formattedUserNotifs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return {
    notifications: combined,
    announcementsData: announcementsRes.data || [],
    userNotifsData: userNotifRes.data || [],
  };
}

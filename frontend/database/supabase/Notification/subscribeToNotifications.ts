import { supabase } from "../General/supabaseClient";

export function subscribeToNotifications(
  userId: string,
  onUpdate: () => void
): () => void {
  const channelId = `${userId}_${Date.now()}`;

  // Listen to Announcements
  const announcementChannel = supabase
    .channel(`public:Posts:announcement-check-${channelId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "Posts",
        filter: "type=eq.announcement",
      },
      () => onUpdate()
    )
    .subscribe();

  // Listen to UserNotifications
  const userNotifChannel = supabase
    .channel(`public:UserNotifications:${channelId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "UserNotifications",
        filter: `user_id=eq.${userId}`,
      },
      () => onUpdate()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(announcementChannel);
    supabase.removeChannel(userNotifChannel);
  };
}

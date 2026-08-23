import { supabase } from "../General/supabaseClient";

export async function markNotificationsAsRead(
  userId: string,
  now: string = new Date().toISOString()
): Promise<{ error: any }> {
  try {
    // 1. Update Global Last Read (For announcements)
    const { error: statusError } = await supabase
      .from("NotificationStatus")
      .upsert({ user_id: userId, last_read_at: now }, { onConflict: "user_id" });

    if (statusError) {
      console.error("Failed to mark announcements as read", statusError);
      return { error: statusError };
    }

    // 2. Update UserNotifications (Set is_read = true)
    const { error: userNotifError } = await supabase
      .from("UserNotifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (userNotifError) {
      console.error("Failed to mark system notifications as read", userNotifError);
      return { error: userNotifError };
    }

    return { error: null };
  } catch (err) {
    console.error("Unexpected error in markNotificationsAsRead:", err);
    return { error: err };
  }
}

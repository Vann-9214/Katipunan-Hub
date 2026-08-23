import { supabase } from "../General/supabaseClient";

export async function clearAllUserNotifications(
  userId: string
): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from("UserNotifications")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to clear notifications:", error);
      return { error };
    }

    return { error: null };
  } catch (err) {
    console.error("Unexpected error clearing notifications:", err);
    return { error: err };
  }
}

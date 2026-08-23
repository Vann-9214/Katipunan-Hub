import { supabase } from "../General/supabaseClient";

/**
 * Subscribes to realtime changes (INSERT, UPDATE, DELETE) on the Posts table.
 * Returns an unsubscribe cleanup function.
 */
export function subscribeToAnnouncements(onUpdate: () => void): () => void {
  const channel = supabase
    .channel(`realtime-announcements_${Date.now()}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "Posts" },
      () => {
        onUpdate();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

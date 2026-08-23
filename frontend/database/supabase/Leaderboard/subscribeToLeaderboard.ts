import { supabase } from "../General/supabaseClient";

/**
 * Subscribes to realtime changes (INSERT, UPDATE, DELETE) on the TutorRatings table.
 * Returns an unsubscribe cleanup function.
 */
export function subscribeToLeaderboard(onUpdate: () => void): () => void {
  const channel = supabase
    .channel(`plc-leaderboard-realtime_${Date.now()}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "TutorRatings" },
      () => {
        onUpdate();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

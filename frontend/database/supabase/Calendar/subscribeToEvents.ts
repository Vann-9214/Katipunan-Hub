import { supabase } from "../General/supabaseClient";

export function subscribeToEvents(onChanges: () => void): () => void {
  const channel = supabase
    .channel(`events-calendar-changes_${Date.now()}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "Events" },
      () => {
        onChanges();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

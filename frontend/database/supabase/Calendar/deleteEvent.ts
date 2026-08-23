import { supabase } from "../General/supabaseClient";

export async function deleteEvent(
  eventId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from("Events").delete().eq("id", eventId);
  return {
    error: error ? new Error(error.message) : null,
  };
}

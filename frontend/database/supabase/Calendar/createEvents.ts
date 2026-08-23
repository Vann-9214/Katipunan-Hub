import { supabase } from "../General/supabaseClient";
import type { CreateEventInput } from "./types";

export async function createEvents(
  events: CreateEventInput[]
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from("Events").insert(events);
  return {
    error: error ? new Error(error.message) : null,
  };
}

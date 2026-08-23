import { supabase } from "../General/supabaseClient";
import type { DBEvent } from "./types";

export async function getEvents(): Promise<{ data: DBEvent[] | null; error: Error | null }> {
  const { data, error } = await supabase.from("Events").select("*");
  return {
    data: data as DBEvent[] | null,
    error: error ? new Error(error.message) : null,
  };
}

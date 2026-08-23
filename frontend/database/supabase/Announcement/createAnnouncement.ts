import { supabase } from "../General/supabaseClient";
import type { DBPostRow, NewPostPayload } from "@/features/Announcement/utils/types";

/**
 * Inserts a new announcement post into the Posts table.
 */
export async function createAnnouncement(
  payload: NewPostPayload
): Promise<{ data: DBPostRow | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from("Posts")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Error creating announcement:", error);
      return { data: null, error };
    }

    return { data: data as DBPostRow, error: null };
  } catch (err) {
    console.error("Unexpected error creating announcement:", err);
    return { data: null, error: err };
  }
}

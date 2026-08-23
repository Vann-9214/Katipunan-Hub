import { supabase } from "../General/supabaseClient";
import type { DBPostRow, UpdatePostPayload } from "@/features/Announcement/utils/types";

/**
 * Updates an existing announcement post in the Posts table.
 */
export async function updateAnnouncement(
  payload: UpdatePostPayload
): Promise<{ data: DBPostRow | null; error: any }> {
  const { id: postId, ...postUpdateData } = payload;
  if (!postId) {
    return { data: null, error: new Error("Announcement id is required for update.") };
  }

  try {
    const { data, error } = await supabase
      .from("Posts")
      .update(postUpdateData)
      .eq("id", postId)
      .select()
      .single();

    if (error) {
      console.error("Error updating announcement:", error);
      return { data: null, error };
    }

    return { data: data as DBPostRow, error: null };
  } catch (err) {
    console.error("Unexpected error updating announcement:", err);
    return { data: null, error: err };
  }
}

import { supabase } from "../General/supabaseClient";

/**
 * Deletes an announcement post from the Posts table by its ID.
 */
export async function deleteAnnouncement(
  id: string
): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from("Posts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting announcement:", error);
      return { error };
    }

    return { error: null };
  } catch (err) {
    console.error("Unexpected error deleting announcement:", err);
    return { error: err };
  }
}

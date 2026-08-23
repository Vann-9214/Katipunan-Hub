import { supabase } from "../General/supabaseClient";

/**
 * Fetches all unique tags previously used across posts.
 */
export async function getAnnouncementTags(): Promise<{ data: string[]; error: any }> {
  try {
    const { data, error } = await supabase
      .from("Posts")
      .select("tags")
      .not("tags", "is", null);

    if (error) {
      console.error("Error fetching announcement tags:", error);
      return { data: [], error };
    }

    const allTags = (data || []).flatMap(
      (post: { tags: string[] | null }) => post.tags || []
    );
    const uniqueTags = Array.from(new Set(allTags)).slice(0, 20);

    return { data: uniqueTags, error: null };
  } catch (err) {
    console.error("Unexpected error fetching announcement tags:", err);
    return { data: [], error: err };
  }
}

import { supabase } from "./supabaseClient";

export type UpdatePostPayload = {
  title?: string;
  description?: string;
  images?: string[] | null;
  tags?: string[] | null;
  type?: "announcement" | "highlight";
  visibility?: string | null;
  author_id?: string;
};

export async function updatePost(id: string, payload: UpdatePostPayload) {
  console.log("[updatePost] Attempting update:", { id, payload });

  const { data, error } = await supabase
    .from("Posts")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(); // no `.single()` — it sometimes causes `{}` if no rows match

  if (error) {
    console.error("[updatePost] Supabase error:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.warn("[updatePost] No rows were updated for ID:", id);
    throw new Error("No post was updated. Check if ID exists.");
  }

  console.log("[updatePost] Update successful:", data[0]);
  return data[0];
}

// supabase/Lib/addPosts.ts
import { supabase } from "../../lib/supabaseClient";

export type AddPostParams = {
  title: string;
  description: string;
  images?: string[];
  tags?: string[];
  type: "announcement" | "highlight";
  authorId: string; // required
  visibility?: string | null; // 'global' or course string like 'cba'
};

export async function addPost({
  title,
  description,
  images = [],
  tags = [],
  type,
  authorId,
  visibility = null,
}: AddPostParams) {
  if (!authorId) {
    throw new Error("Author ID missing. Cannot create post.");
  }

  const payload: any = {
    title,
    description,
    images,
    tags,
    type,
    author_id: authorId,
  };

  // only include visibility key if provided (so DB will be null otherwise)
  if (visibility !== undefined) {
    payload.visibility = visibility;
  }

  const { data, error } = await supabase
    .from("Posts")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

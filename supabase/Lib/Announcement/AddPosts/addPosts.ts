// supabase/Lib/addPosts.ts
export type AddPostParams = {
  title: string;
  description: string;
  images?: string[];
  tags?: string[];
  type: "announcement" | "highlight";
  authorId: string;
  visibility?: string | null;
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
  const newPost = {
    id: `post-${Date.now()}`,
    title,
    description,
    images,
    tags,
    type,
    author_id: authorId || "usr_mock_wildcat_01",
    visibility: visibility || "global",
    created_at: new Date().toISOString(),
  };

  return newPost;
}

export type UpdatePostParams = {
  id: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  type: "announcement" | "highlight";
  visibility: string | null;
};

export async function updatePost(params: UpdatePostParams) {
  return {
    ...params,
    updated_at: new Date().toISOString(),
  };
}

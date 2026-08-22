import { useState } from "react";

export const useCommentCount = (_postId: string, _isFeed: boolean = false) => {
  const [count] = useState<number>(2);
  const [loading] = useState(false);

  const refreshCount = async () => {};

  return { count, loading, refreshCount };
};
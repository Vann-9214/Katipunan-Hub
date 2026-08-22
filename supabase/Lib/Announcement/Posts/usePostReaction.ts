// hooks/usePostReactions.ts
"use client";

import { useState } from "react";

interface UsePostReactionsProps {
  postId: string;
  userId: string;
}

export interface ReactionCount {
  reaction: string;
  count: number;
}

/**
 * Manages all reaction logic for a single post (UI mode).
 */
export function usePostReactions({
  postId: _postId,
  userId: _userId,
}: UsePostReactionsProps) {
  const [selectedReactionId, setSelectedReactionId] = useState<string | null>(
    null
  );
  const [topReactions, setTopReactions] = useState<ReactionCount[]>([
    { reaction: "❤️", count: 24 },
    { reaction: "👍", count: 18 },
    { reaction: "🔥", count: 12 },
  ]);
  const [reactionCount, setReactionCount] = useState<number | null>(54);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading] = useState(false);

  const handleReactionClick = async (reactionId: string) => {
    setIsLoading(true);
    if (selectedReactionId === reactionId) {
      setSelectedReactionId(null);
      setReactionCount((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      setTopReactions((prev) =>
        prev.map((r) =>
          r.reaction === reactionId
            ? { ...r, count: Math.max(0, r.count - 1) }
            : r
        )
      );
    } else {
      setSelectedReactionId(reactionId);
      setReactionCount((prev) => (prev !== null ? prev + 1 : 1));
      setTopReactions((prev) => {
        const exists = prev.some((r) => r.reaction === reactionId);
        if (exists) {
          return prev.map((r) =>
            r.reaction === reactionId ? { ...r, count: r.count + 1 } : r
          );
        }
        return [...prev, { reaction: reactionId, count: 1 }];
      });
    }
    setIsLoading(false);
  };

  return {
    selectedReactionId,
    topReactions,
    reactionCount,
    isLoading,
    isInitialLoading,
    handleReactionClick,
    handleReactionSelect: (id: string) => handleReactionClick(id),
    handleMainButtonClick: () =>
      handleReactionClick(selectedReactionId ? selectedReactionId : "like"),
    getReactionData: () => {},
  };
}
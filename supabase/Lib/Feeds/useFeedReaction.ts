"use client";

import { useState } from "react";

interface UseFeedReactionsProps {
  feedId: string;
  userId: string;
}

export interface ReactionCount {
  reaction: string;
  count: number;
}

export function useFeedReaction({ feedId: _feedId, userId: _userId }: UseFeedReactionsProps) {
  const [selectedReactionId, setSelectedReactionId] = useState<string | null>(null);
  const [topReactions, setTopReactions] = useState<ReactionCount[]>([
    { reaction: "❤️", count: 12 },
    { reaction: "👍", count: 8 },
  ]);
  const [reactionCount, setReactionCount] = useState<number | null>(20);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading] = useState(false);

  const updateReaction = (newReactionId: string | null) => {
    setIsLoading(true);
    setSelectedReactionId(newReactionId);
    if (newReactionId) {
      setReactionCount((prev) => (prev ?? 0) + 1);
    } else {
      setReactionCount((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }
    setIsLoading(false);
  };

  return {
    selectedReactionId,
    reactionCount,
    topReactions,
    isLoading,
    isInitialLoading,
    handleReactionSelect: (id: string) =>
      updateReaction(selectedReactionId === id ? null : id),
    handleMainButtonClick: () =>
      updateReaction(selectedReactionId ? null : "like"),
  };
}
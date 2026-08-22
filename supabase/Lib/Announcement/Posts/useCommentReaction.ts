"use client";

import { useState } from "react";

export const useCommentReaction = (
  initialReactionId: string | null,
  _commentId: string
) => {
  const [currentUserReaction, setCurrentUserReaction] =
    useState(initialReactionId);
  const [isLoading, setIsLoading] = useState(false);

  const handleReaction = async (reactionId: string | null) => {
    setIsLoading(true);
    setCurrentUserReaction(reactionId);
    setIsLoading(false);
  };

  const onMainClick = () => {
    handleReaction(currentUserReaction ? null : "like");
  };

  const onPickerSelect = (id: string) => {
    handleReaction(currentUserReaction === id ? null : id);
  };

  return {
    currentUserReaction,
    isLoading,
    onMainClick,
    onPickerSelect,
  };
};

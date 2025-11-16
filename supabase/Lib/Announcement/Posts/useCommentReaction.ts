"use client";

import { useState } from "react";
import { supabase } from "../../General/supabaseClient";
// --- 1. REMOVE `useRouter` ---
// We will use Supabase Realtime instead.

// This hook manages the logic for reacting to a *single comment*
export const useCommentReaction = (
  initialReactionId: string | null,
  commentId: string
) => {
  // --- 2. REMOVE `router` instance ---

  // This state is for the "optimistic update"
  // It makes the button change color instantly, before the DB call finishes
  const [currentUserReaction, setCurrentUserReaction] =
    useState(initialReactionId);
  const [isLoading, setIsLoading] = useState(false);

  // This is the main function that does the work
  const handleReaction = async (reactionId: string | null) => {
    setIsLoading(true);

    // --- 1. Optimistic Update ---
    // Update the UI *before* the database call
    setCurrentUserReaction(reactionId);

    try {
      // Get the currently logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not logged in");

      // --- 2. Database Call ---

      // A: User is removing their reaction
      if (reactionId === null) {
        const { error } = await supabase
          .from("PostCommentReactions")
          .delete()
          .match({ comment_id: commentId, user_id: user.id });

        if (error) throw error;

        // B: User is adding or changing their reaction
      } else {
        // --- THIS IS THE FIX ---
        // We MUST tell upsert which columns to check for a conflict.
        // This stops the "duplicate key" error.
        const { error } = await supabase.from("PostCommentReactions").upsert(
          {
            comment_id: commentId,
            user_id: user.id,
            reaction: reactionId,
          },
          {
            onConflict: "comment_id, user_id", // Check for duplicates on these columns
          }
        );
        // --- END FIX ---

        if (error) throw error;
      }

      // --- 3. REMOVE `router.refresh()` ---
      // The realtime subscription in `useComment.ts`
      // will now handle the data refresh.
      // --- End Fix ---
    } catch (error: any) {
      console.error("Error handling reaction:", error.message || error);
      // Revert the optimistic update if the DB call fails
      setCurrentUserReaction(initialReactionId);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 4. Click Handlers for the UI ---

  // Main button click: either add "like" or remove current reaction
  const onMainClick = () => {
    // If the user already has a reaction, clicking "Like" removes it.
    // If they have no reaction, it adds "like".
    handleReaction(currentUserReaction ? null : "like");
  };

  // Picker click: select a specific reaction
  const onPickerSelect = (id: string) => {
    // If they click the same reaction, remove it.
    // Otherwise, set it to the new one.
    handleReaction(currentUserReaction === id ? null : id);
  };

  return {
    currentUserReaction,
    isLoading,
    onMainClick,
    onPickerSelect,
  };
};


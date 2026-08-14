// hooks/usePostReactions.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../General/supabaseClient";

interface UsePostReactionsProps {
  postId: string;
  userId: string;
}

export interface ReactionCount {
  reaction: string;
  count: number;
}

/**
 * Manages all reaction logic for a single post.
 */
export function usePostReactions({ postId, userId }: UsePostReactionsProps) {

  const [selectedReactionId, setSelectedReactionId] = useState<string | null>(
    null
  );
  const [topReactions, setTopReactions] = useState<ReactionCount[]>([]);
  const [reactionCount, setReactionCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // --- 1. THIS IS THE FIXED FUNCTION ---
  // It no longer depends on or sets 'isInitialLoading'.
  // It is now a stable utility function.
  const fetchAllReactionData = useCallback(async () => {
    if (!postId || !userId) {
      return;
    }

    const [aggData, userReactionResult] = await Promise.all([
      supabase.rpc("get_reaction_counts", { p_post_id: postId }),
      supabase
        .from("PostReactions")
        .select("reaction")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

    // Handle aggregate data result
    if (aggData.error) {
      console.error("Error fetching counts:", aggData.error.message);
      setTopReactions([]);
      setReactionCount(0);
    } else {
      const data = aggData.data as ReactionCount[];
      setTopReactions(data);

      const total = data.reduce(
        (acc: number, item: ReactionCount) => acc + item.count,
        0
      );
      setReactionCount(total);
    }

    // Handle user reaction result
    if (userReactionResult.error) {
      console.error("Error fetching reaction:", userReactionResult.error);
    } else {
      // @ts-ignore
      setSelectedReactionId(userReactionResult.data?.reaction || null);
    }
  }, [supabase, postId, userId]); // <-- Dependencies are stable!

  // --- 2. Initial Data Fetching (FIXED) ---
  // This useEffect now manages its own loading state.
  // It runs when postId or userId changes.
  useEffect(() => {
    if (postId && userId) {
      const loadInitialData = async () => {
        setIsInitialLoading(true);
        await fetchAllReactionData();
        setIsInitialLoading(false);
      };
      loadInitialData();
    } else {
      // Not ready to load
      setIsInitialLoading(false);
    }
    // fetchAllReactionData is stable and won't cause loops
  }, [postId, userId, fetchAllReactionData]);

  // --- 3. Real-time Subscription ---
  // This is now stable because fetchAllReactionData is stable.
  useEffect(() => {
    const channel = supabase
      .channel(`reaction-count-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "PostReactions",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          // This call no longer causes any loading state issues
          fetchAllReactionData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, postId, fetchAllReactionData]);

  // --- 4. Data Mutation (FIXED) ---
  // The 'finally' block is now correct.
  const updateDatabaseReaction = async (newReactionId: string | null) => {
    if (isLoading) return;
    setIsLoading(true);

    const oldReactionId = selectedReactionId;
    const oldReactionCount = reactionCount ?? 0;

    let optimisticCount = oldReactionCount;
    if (newReactionId && !oldReactionId) optimisticCount++;
    else if (!newReactionId && oldReactionId) optimisticCount--;

    setReactionCount(optimisticCount);
    setSelectedReactionId(newReactionId);

    try {
      if (newReactionId) {
        const { error } = await supabase
          .from("PostReactions")
          .upsert(
            { post_id: postId, user_id: userId, reaction: newReactionId },
            { onConflict: "post_id, user_id" }
          );
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("PostReactions")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);
        if (error) throw error;
      }
    } catch (error: any)
    {
      console.error("🔴 Error updating reaction:", error.message);
      setReactionCount(oldReactionCount);
      setSelectedReactionId(oldReactionId);
      alert(`Failed to update reaction: ${error?.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
      // This call is now safe and won't trigger 'isInitialLoading'
      fetchAllReactionData();
    }
  };

  // --- 5. Public Event Handlers (Unmodified) ---
  const handleReactionSelect = (id: string) => {
    const newReactionId = selectedReactionId === id ? null : id;
    updateDatabaseReaction(newReactionId);
  };

  const handleMainButtonClick = () => {
    const newReactionId = selectedReactionId ? null : "like";
    updateDatabaseReaction(newReactionId);
  };

  // --- 6. Export (FIXED) ---
  // We export the stable fetchAllReactionData function
  return {
    selectedReactionId,
    reactionCount,
    topReactions,
    isLoading,
    isInitialLoading,
    handleReactionSelect,
    handleMainButtonClick,
    getReactionData: fetchAllReactionData, // <-- Export the stable function
  };
}
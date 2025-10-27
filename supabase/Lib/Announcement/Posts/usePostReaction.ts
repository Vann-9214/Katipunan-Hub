// hooks/usePostReactions.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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
  const supabase = createClientComponentClient();

  const [selectedReactionId, setSelectedReactionId] = useState<string | null>(
    null
  );
  const [topReactions, setTopReactions] = useState<ReactionCount[]>([]);
  const [reactionCount, setReactionCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // --- 1. Function to fetch ALL reaction data ---
  const getReactionData = useCallback(async () => {
    if (!postId) return;

    const { data, error } = await supabase.rpc("get_reaction_counts", {
      p_post_id: postId,
    });

    if (error) {
      console.error("Error fetching reaction counts:", error.message);
      setTopReactions([]);
      setReactionCount(0);
    } else {
      const reactionData = data as ReactionCount[];
      setTopReactions(reactionData);

      // --- FIXED: Explicitly type acc and item ---
      const total = reactionData.reduce(
        (acc: number, item: ReactionCount) => acc + item.count,
        0
      );
      setReactionCount(total);
    }
  }, [supabase, postId]);

  // --- 2. Initial Data Fetching ---
  useEffect(() => {
    if (!postId || !userId) {
      setIsInitialLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      setIsInitialLoading(true);

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
        
        // --- FIXED: Explicitly type acc and item ---
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

      setIsInitialLoading(false);
    };

    fetchInitialData();
  }, [postId, userId, supabase]);

  // --- 3. Real-time Subscription (UNMODIFIED) ---
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
          getReactionData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, postId, getReactionData]);

  // --- 4. Data Mutation (Optimistic Update - UNMODIFIED) ---
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
    } catch (error: any) {
      console.error("🔴 Error updating reaction:", error.message);
      setReactionCount(oldReactionCount);
      setSelectedReactionId(oldReactionId);
      alert(`Failed to update reaction: ${error?.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
      getReactionData();
    }
  };

  // --- 5. Public Event Handlers (UNMODIFIED) ---
  const handleReactionSelect = (id: string) => {
    const newReactionId = selectedReactionId === id ? null : id;
    updateDatabaseReaction(newReactionId);
  };

  const handleMainButtonClick = () => {
    const newReactionId = selectedReactionId ? null : "like";
    updateDatabaseReaction(newReactionId);
  };

  return {
    selectedReactionId,
    reactionCount,
    topReactions,
    isLoading,
    isInitialLoading,
    handleReactionSelect,
    handleMainButtonClick,
  };
}
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/database/supabase/General/supabaseClient";

interface UsePostReactionsProps {
  postId: string;
  userId?: string;
}

export interface ReactionCount {
  reaction: string;
  count: number;
}

export function usePostReactions({ postId, userId }: UsePostReactionsProps) {
  const [selectedReactionId, setSelectedReactionId] = useState<string | null>(
    null
  );
  const [topReactions, setTopReactions] = useState<ReactionCount[]>([]);
  const [reactionCount, setReactionCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const fetchAllReactionData = useCallback(async () => {
    if (!postId) return;

    try {
      // 1. Fetch aggregate reactions for post
      const { data: rows, error: countError } = await supabase
        .from("PostReactions")
        .select("reaction")
        .eq("post_id", postId);

      if (!countError && rows) {
        const counts: Record<string, number> = {};
        rows.forEach((r: { reaction: string }) => {
          if (r.reaction) {
            counts[r.reaction] = (counts[r.reaction] || 0) + 1;
          }
        });
        const topList: ReactionCount[] = Object.entries(counts)
          .map(([reaction, count]) => ({ reaction, count }))
          .sort((a, b) => b.count - a.count);
        setTopReactions(topList);
        setReactionCount(rows.length);
      } else {
        setTopReactions([]);
        setReactionCount(0);
      }

      // 2. Fetch user's reaction
      if (userId) {
        const { data: userReactionData } = await supabase
          .from("PostReactions")
          .select("reaction")
          .eq("post_id", postId)
          .eq("user_id", userId)
          .maybeSingle();

        setSelectedReactionId(userReactionData?.reaction || null);
      } else {
        setSelectedReactionId(null);
      }
    } catch (err) {
      console.error("Error in fetchAllReactionData:", err);
    }
  }, [postId, userId]);

  useEffect(() => {
    let isMounted = true;
    if (postId) {
      setIsInitialLoading(true);
      fetchAllReactionData().finally(() => {
        if (isMounted) setIsInitialLoading(false);
      });
    } else {
      setIsInitialLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [postId, fetchAllReactionData]);

  // Real-time subscription
  useEffect(() => {
    if (!postId) return;

    const channelName = `reaction-count-${postId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "PostReactions",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchAllReactionData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, fetchAllReactionData]);

  const updateDatabaseReaction = async (newReactionId: string | null) => {
    if (isLoading || !userId || !postId) return;
    setIsLoading(true);

    const oldReactionId = selectedReactionId;
    const oldReactionCount = reactionCount ?? 0;

    let optimisticCount = oldReactionCount;
    if (newReactionId && !oldReactionId) optimisticCount++;
    else if (!newReactionId && oldReactionId)
      optimisticCount = Math.max(0, optimisticCount - 1);

    setReactionCount(optimisticCount);
    setSelectedReactionId(newReactionId);

    try {
      if (newReactionId) {
        const { error } = await supabase.from("PostReactions").upsert(
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
      console.error("Error updating reaction:", error?.message);
      setReactionCount(oldReactionCount);
      setSelectedReactionId(oldReactionId);
    } finally {
      setIsLoading(false);
      fetchAllReactionData();
    }
  };

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
    getReactionData: fetchAllReactionData,
  };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../General/supabaseClient";

interface UseFeedReactionsProps {
  feedId: string;
  userId: string;
}

export interface ReactionCount {
  reaction: string;
  count: number;
}

export function useFeedReaction({ feedId, userId }: UseFeedReactionsProps) {
  const [selectedReactionId, setSelectedReactionId] = useState<string | null>(null);
  const [topReactions, setTopReactions] = useState<ReactionCount[]>([]);
  const [reactionCount, setReactionCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const fetchAllReactionData = useCallback(async () => {
    if (!feedId) return;

    // 1. Get Counts
    const { data: aggData } = await supabase.rpc("get_feed_reaction_counts", { p_feed_id: feedId });
    
    // 2. Get User's Reaction
    let userReaction = null;
    if (userId) {
      const { data } = await supabase
        .from("FeedReactions")
        .select("reaction")
        .eq("feed_id", feedId)
        .eq("user_id", userId)
        .maybeSingle();
      userReaction = data?.reaction || null;
    }

    // 3. Set State
    if (aggData) {
      setTopReactions(aggData as ReactionCount[]);
      const total = (aggData as ReactionCount[]).reduce((acc, item) => acc + item.count, 0);
      setReactionCount(total);
    } else {
      setTopReactions([]);
      setReactionCount(0);
    }
    setSelectedReactionId(userReaction);
  }, [feedId, userId]);

  // Initial Load
  useEffect(() => {
    const load = async () => {
      setIsInitialLoading(true);
      await fetchAllReactionData();
      setIsInitialLoading(false);
    };
    load();
  }, [feedId, userId, fetchAllReactionData]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`feed-reaction-${feedId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "FeedReactions", filter: `feed_id=eq.${feedId}` }, () => {
        fetchAllReactionData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [feedId, fetchAllReactionData]);

  // Handle Updates
  const updateDatabaseReaction = async (newReactionId: string | null) => {
    if (isLoading || !userId) return;
    setIsLoading(true);

    // Optimistic Update
    const oldReactionId = selectedReactionId;
    const oldReactionCount = reactionCount ?? 0;
    setSelectedReactionId(newReactionId);
    
    let newCount = oldReactionCount;
    if (newReactionId && !oldReactionId) newCount++;
    else if (!newReactionId && oldReactionId) newCount--;
    setReactionCount(newCount);

    try {
      if (newReactionId) {
        await supabase.from("FeedReactions").upsert(
          { feed_id: feedId, user_id: userId, reaction: newReactionId },
          { onConflict: "feed_id, user_id" }
        );
      } else {
        await supabase.from("FeedReactions").delete().match({ feed_id: feedId, user_id: userId });
      }
    } catch (error) {
      console.error(error);
      // Revert if error
      setSelectedReactionId(oldReactionId);
      setReactionCount(oldReactionCount);
    } finally {
      setIsLoading(false);
      fetchAllReactionData(); // Sync correct state
    }
  };

  return {
    selectedReactionId,
    reactionCount,
    topReactions,
    isLoading,
    isInitialLoading,
    handleReactionSelect: (id: string) => updateDatabaseReaction(selectedReactionId === id ? null : id),
    handleMainButtonClick: () => updateDatabaseReaction(selectedReactionId ? null : "like"),
  };
}
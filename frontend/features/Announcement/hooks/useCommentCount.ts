"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/database/supabase/General/supabaseClient";

export function useCommentCount(postId: string) {
  const [commentCount, setCommentCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    if (!postId) return;

    try {
      const { count, error } = await supabase
        .from("PostComments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);

      if (!error && count !== null) {
        setCommentCount(count);
      }
    } catch (err) {
      console.error("Error fetching comment count:", err);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      fetchCount();
    }
  }, [postId, fetchCount]);

  // Real-time subscription
  useEffect(() => {
    if (!postId) return;

    const channelName = `post-comments-count-${postId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "PostComments",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, fetchCount]);

  return {
    commentCount,
    isLoading,
    refreshCount: fetchCount,
  };
}

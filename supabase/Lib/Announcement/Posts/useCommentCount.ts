// supabase/Lib/Announcement/Posts/useCommentCount.ts
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState, useCallback } from "react";

export function useCommentCount(postId: string) {
  const [count, setCount] = useState(0);
  const supabase = createClientComponentClient(); // No broadcast option

  // 1. This is the re-usable fetch function
  const fetchCount = useCallback(async () => {
    if (!postId) return;

    const { count, error } = await supabase
      .from("PostComments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    if (error) {
      console.error("Error fetching comment count:", error);
      setCount(0);
    } else {
      setCount(count ?? 0);
    }
  }, [supabase, postId]);

  // 2. Fetch count on initial load
  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // 3. Subscribe to real-time changes
  // (This will only catch *other* users' changes now)
  useEffect(() => {
    const channel = supabase
      .channel(`comment-count-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to INSERT and DELETE
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
  }, [supabase, postId, fetchCount]);

  // 4. Export the count AND the refresh function
  return {
    count,
    refreshCount: fetchCount, // This is what 'Posts.tsx' will use
  };
}
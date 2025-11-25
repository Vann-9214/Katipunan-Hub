import { useState, useEffect } from "react";
import { supabase } from "../../General/supabaseClient";

export const useCommentCount = (postId: string, isFeed: boolean = false) => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = async () => {
    if (!postId) return;
    try {
      const table = isFeed ? "FeedComments" : "PostComments";
      const column = isFeed ? "feed_id" : "post_id";

      const { count: fetchedCount, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true })
        .eq(column, postId);

      if (error) throw error;
      setCount(fetchedCount || 0);
    } catch (err) {
      console.error("Error fetching comment count:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
    
    // Subscribe to changes
    const table = isFeed ? "FeedComments" : "PostComments";
    const filter = isFeed ? `feed_id=eq.${postId}` : `post_id=eq.${postId}`;

    const channel = supabase
      .channel(`comment-count-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: table,
          filter: filter,
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, isFeed]);

  return { count, loading, refreshCount: fetchCount };
};
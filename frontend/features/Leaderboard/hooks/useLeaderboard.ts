"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getPLCHighlights,
  subscribeToLeaderboard,
  PLCHighlight,
} from "@/database/supabase/Leaderboard";

export function useLeaderboard() {
  const [items, setItems] = useState<PLCHighlight[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHighlights = async () => {
    try {
      const data = await getPLCHighlights();
      setItems(data || []);
    } catch (err) {
      console.error("Error fetching leaderboard highlights:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const memoizedFetchHighlights = useCallback(fetchHighlights, []);

  useEffect(() => {
    memoizedFetchHighlights();
    const unsubscribe = subscribeToLeaderboard(() => {
      memoizedFetchHighlights();
    });

    return () => {
      unsubscribe();
    };
  }, [memoizedFetchHighlights]);

  return {
    items,
    loading,
    refetch: memoizedFetchHighlights,
  };
}

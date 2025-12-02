"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../General/supabaseClient";
import { PostUI } from "@/app/component/General/Announcement/Utils/types";
// 1. Import the relative time formatter instead of the fixed one
import formatPostDate from "@/app/component/General/Announcement/Utils/formatDate";

export function useUserPosts(userId: string | undefined) {
  const [posts, setPosts] = useState<PostUI[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("Feeds")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user feeds:", error);
    } else if (data) {
      const formatted: PostUI[] = data.map((p) => ({
        id: p.id,
        title: "", 
        description: p.content, 
        images: p.images || [],
        tags: [], 
        type: "feed", 
        visibility: "global", 
        author_id: p.author_id,
        created_at: p.created_at,
        // 2. Use formatPostDate here
        date: formatPostDate(p.created_at), 
      }));
      setPosts(formatted);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, refetch: fetchPosts };
}
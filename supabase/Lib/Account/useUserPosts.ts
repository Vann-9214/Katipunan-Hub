"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../General/supabaseClient";
import { PostUI } from "@/app/component/General/Announcement/Utils/types";
import { formatDateWithAmPm } from "@/app/component/General/Announcement/AnnouncementContent/utils";

export function useUserPosts(userId: string | undefined) {
  const [posts, setPosts] = useState<PostUI[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    // CHANGED: Fetch from 'Feeds' table instead of 'Posts'
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
        title: "", // Feeds don't have titles
        description: p.content, // Map 'content' to 'description'
        images: p.images || [],
        tags: [], // Feeds don't use tags
        type: "feed", // Explicitly set type to feed
        visibility: "global", // Feeds are usually global
        author_id: p.author_id,
        created_at: p.created_at,
        date: formatDateWithAmPm(p.created_at),
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
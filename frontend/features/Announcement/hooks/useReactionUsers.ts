"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/database/supabase/General/supabaseClient";

export interface ReactionUser {
  reaction: string;
  user: {
    id: string;
    fullName: string;
    avatarURL: string;
  };
}

interface RawReactionData {
  reaction: string;
  user_id: string;
  Accounts?: {
    id: string;
    fullName: string | null;
    avatarURL: string | null;
  } | null;
}

export function useReactionUsers(
  postId: string,
  isPopupVisible: boolean,
  totalCount: number | null
) {
  const [users, setUsers] = useState<ReactionUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);

  const fetchUsers = useCallback(async () => {
    if (!isPopupVisible || !postId || !totalCount) return;
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("PostReactions")
        .select(`
          reaction,
          user_id,
          Accounts:user_id (
            id,
            fullName,
            avatarURL
          )
        `)
        .eq("post_id", postId)
        .limit(50);

      if (error) throw error;

      if (data) {
        const rawData = data as unknown as RawReactionData[];
        const mappedUsers: ReactionUser[] = rawData.map((item) => ({
          reaction: item.reaction,
          user: {
            id: item.Accounts?.id || item.user_id,
            fullName: item.Accounts?.fullName || "User",
            avatarURL: item.Accounts?.avatarURL || "/DefaultAvatar.svg",
          },
        }));
        setUsers(mappedUsers);
      }
    } catch (err) {
      console.error("Error fetching reaction users:", err);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [postId, isPopupVisible, totalCount]);

  useEffect(() => {
    if (isPopupVisible) {
      fetchUsers();
    } else {
      setUsers([]);
    }
  }, [isPopupVisible, fetchUsers]);

  return {
    users,
    isLoading,
  };
}

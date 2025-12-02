// src/app/component/General/Announcement/Posts/useReactionUser.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../../../../../supabase/Lib/General/supabaseClient";

export interface ReactionUser {
  reaction: string;
  user: {
    id: string;
    fullName: string;
    avatarURL: string;
  };
}

// Define the shape of the raw data from Supabase to avoid 'any'
interface RawReactionData {
  reaction: string;
  user_id: string;
  Accounts: {
    id: string;
    fullName: string | null;
    avatarURL: string | null;
  } | null; // Accounts might be null if the join fails or user is deleted
}

export type ReactionSourceType = "post" | "feed" | "post_comment" | "feed_comment";

export function useReactionUsers(
  referenceId: string,
  sourceType: ReactionSourceType,
  isPopupVisible: boolean,
  totalCount: number | null
) {
  const [users, setUsers] = useState<ReactionUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const isLoadingRef = useRef(false);

  const fetchUsers = useCallback(async () => {
    if (!isPopupVisible || !referenceId || !totalCount) return;
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      let tableName = "";
      let idColumn = "";

      switch (sourceType) {
        case "post":
          tableName = "PostReactions";
          idColumn = "post_id";
          break;
        case "feed":
          tableName = "FeedReactions";
          idColumn = "feed_id";
          break;
        case "post_comment":
          tableName = "PostCommentReactions";
          idColumn = "comment_id";
          break;
        case "feed_comment":
          tableName = "FeedCommentReactions";
          idColumn = "feed_comment_id";
          break;
      }

      const { data, error } = await supabase
        .from(tableName)
        .select(`
          reaction,
          user_id,
          Accounts:user_id (
            id,
            fullName,
            avatarURL
          )
        `)
        .eq(idColumn, referenceId)
        .limit(50); 

      if (error) throw error;

      if (data) {
        // Cast data to our specific type
        const rawData = data as unknown as RawReactionData[];

        const mappedUsers: ReactionUser[] = rawData.map((item) => ({
          reaction: item.reaction,
          user: {
            // Handle potential nulls safely
            id: item.Accounts?.id || item.user_id,
            fullName: item.Accounts?.fullName || "Unknown User",
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
  }, [referenceId, sourceType, isPopupVisible, totalCount]);

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
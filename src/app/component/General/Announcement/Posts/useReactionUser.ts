// src/app/component/General/Announcement/Posts/useReactionUser.ts
"use client";

import { useState, useEffect } from "react";

export interface ReactionUser {
  reaction: string;
  user: {
    id: string;
    fullName: string;
    avatarURL: string;
  };
}

export type ReactionSourceType = "post" | "feed" | "post_comment" | "feed_comment";

const MOCK_REACTION_USERS: ReactionUser[] = [
  {
    reaction: "❤️",
    user: {
      id: "usr_maria_03",
      fullName: "Maria Santos",
      avatarURL: "/Cit Logo.svg",
    },
  },
  {
    reaction: "👍",
    user: {
      id: "usr_alex_02",
      fullName: "Alex Rivera",
      avatarURL: "/Cit Logo.svg",
    },
  },
  {
    reaction: "🔥",
    user: {
      id: "usr_david_04",
      fullName: "David Lim",
      avatarURL: "/Cit Logo.svg",
    },
  },
];

export function useReactionUsers(
  referenceId: string,
  sourceType: ReactionSourceType,
  isPopupVisible: boolean,
  totalCount: number | null
) {
  const [users, setUsers] = useState<ReactionUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isPopupVisible && referenceId && sourceType && totalCount !== null) {
      setIsLoading(false);
      setUsers(MOCK_REACTION_USERS);
    } else {
      setUsers([]);
    }
  }, [isPopupVisible, referenceId, sourceType, totalCount]);

  return {
    users,
    isLoading,
  };
}
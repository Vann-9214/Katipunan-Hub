// src/app/component/General/Announcement/Posts/useReactionUsers.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ReactionCount } from "../../../../../../supabase/Lib/Feeds/useFeedReaction";

export interface ReactionUser {
  reaction: string;
  user: {
    id: string;
    fullName: string;
    avatarURL: string;
  };
}

// MOCK DATA: Simulates fetching the first few users for the top 3 reactions.
const mockFetchUsers = (
  postId: string,
  topReactions: ReactionCount[]
): Promise<ReactionUser[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allUsers: ReactionUser[] = [];
      const userList = [
        { id: "user1", fullName: "Alice Johnson", avatarURL: "/DefaultAvatar.svg" },
        { id: "user2", fullName: "Bob Smith", avatarURL: "/DefaultAvatar.svg" },
        { id: "user3", fullName: "Charlie Brown", avatarURL: "/DefaultAvatar.svg" },
        { id: "user4", fullName: "Diana Prince", avatarURL: "/DefaultAvatar.svg" },
        { id: "user5", fullName: "Ethan Hunt", avatarURL: "/DefaultAvatar.svg" },
        { id: "user6", fullName: "Fiona Glenn", avatarURL: "/DefaultAvatar.svg" },
        { id: "user7", fullName: "George King", avatarURL: "/DefaultAvatar.svg" },
        { id: "user8", fullName: "Hannah Scott", avatarURL: "/DefaultAvatar.svg" },
      ];

      topReactions.slice(0, 3).forEach((r, rIndex) => {
        // Mock a few users for each top reaction
        const count = Math.min(r.count, 4); // Limit to 4 mock users per reaction for display
        for (let i = 0; i < count; i++) {
          const userIndex = (rIndex * 4 + i) % userList.length;
          allUsers.push({
            reaction: r.reaction,
            user: {
              ...userList[userIndex],
              fullName: `${r.reaction.toUpperCase()} by ${userList[userIndex].fullName}` // Add context
            },
          });
        }
      });
      
      // Filter unique users by ID to avoid duplicate display
      const uniqueUsersMap = new Map<string, ReactionUser>();
      allUsers.forEach(item => {
        if (!uniqueUsersMap.has(item.user.id)) {
            uniqueUsersMap.set(item.user.id, item);
        } else {
             // For simplicity, skip. In a real app, you might merge or prioritize
        }
      });

      resolve(Array.from(uniqueUsersMap.values()));
    }, 500); // Simulate network delay
  });
};

export function useReactionUsers(
  postId: string,
  topReactions: ReactionCount[],
  isPopupVisible: boolean,
  totalCount: number | null
) {
  const [users, setUsers] = useState<ReactionUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dataRef = useRef<{postId: string, topReactions: ReactionCount[], totalCount: number | null}>({postId, topReactions, totalCount});

  // Keep ref updated
  useEffect(() => {
    dataRef.current = {postId, topReactions, totalCount};
  }, [postId, topReactions, totalCount]);

  const fetchUsers = useCallback(async () => {
    // Only fetch if the popup is actually visible and there are reactions
    if (!isPopupVisible || (totalCount === 0 || totalCount === null)) {
      return;
    }
    
    // Prevent fetching if already loading
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const fetchedUsers = await mockFetchUsers(
        dataRef.current.postId,
        dataRef.current.topReactions
      );
      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Error fetching reaction users:", err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [isPopupVisible, totalCount, isLoading]);

  useEffect(() => {
    // Only fetch on visibility change (show) or if the post changes while visible
    if (isPopupVisible) {
      fetchUsers();
    } else {
        // Clear list when hidden for fresh data next time
        setUsers([]);
    }
  }, [isPopupVisible, postId]);


  return {
    users,
    isLoading,
  };
}
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/database/supabase/General/user";
import { getCurrentUserDetails } from "@/database/supabase/General/getUser";
import { getAccountById } from "@/database/supabase/Account/getAccountById";

interface UseAccountProps {
  targetUserId?: string;
}

export function useAccount({ targetUserId }: UseAccountProps = {}) {
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const router = useRouter();

  const loadData = useCallback(async () => {
    setIsInitialLoading(true);

    const loggedIn = await getCurrentUserDetails();
    if (!loggedIn) {
      router.push("/signin");
      return;
    }
    setCurrentUser(loggedIn);

    if (targetUserId) {
      if (targetUserId === loggedIn.id) {
        setViewedUser(loggedIn);
      } else {
        const { data: account, error } = await getAccountById(targetUserId);

        if (account) {
          setViewedUser(account);
        } else {
          console.error("User not found:", error);
        }
      }
    } else {
      setViewedUser(loggedIn);
    }

    setIsInitialLoading(false);
  }, [router, targetUserId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateSuccess = useCallback((updatedData: Partial<User>) => {
    setViewedUser((prev) => (prev ? { ...prev, ...updatedData } : null));
    setCurrentUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  }, []);

  const isOwner = !targetUserId || currentUser?.id === viewedUser?.id;

  return {
    viewedUser,
    currentUser,
    isInitialLoading,
    isOwner,
    handleUpdateSuccess,
    reload: loadData,
  };
}

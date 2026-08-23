"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserDetails } from "@/database/supabase/General/getUser";
import type { User } from "@/database/supabase/General/user";

export function useLeaderboardUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    getCurrentUserDetails()
      .then((u) => {
        if (isMounted) {
          if (!u) {
            router.push("/");
            return;
          }
          setUser(u);
        }
      })
      .catch((err) => {
        console.error("Auth error in Leaderboard:", err);
        if (isMounted) router.push("/");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  return { user, loading };
}

"use client";

import HomepageTab from "@/components/HomepageTab";
import { useState, useEffect, Suspense } from "react";
import { getCurrentUserDetails } from "@/database/supabase/General/getUser";
import type { User } from "@/database/supabase/General/user";
import FeedsContent from "@/features/Feed/feedContent";
import LoadingScreen from "@/components/LoadingScreen";

export default function Feeds() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userDetails = await getCurrentUserDetails();
      setUser(userDetails);
    };
    loadUser();
  }, []);

  return (
    <div className="p-[25px]">
      <HomepageTab user={user} />

      {/* 3. Wrapped FeedsContent in Suspense to fix build error */}
      <Suspense fallback={<LoadingScreen />}>
        <FeedsContent />
      </Suspense>
    </div>
  );
}

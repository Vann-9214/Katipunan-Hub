"use client";

import { useState, useEffect } from "react";
import { getCurrentUserDetails } from "@/database/supabase/General/getUser";
import type { User } from "@/database/supabase/General/user";
import HomepageTab from "@/components/HomepageTab";
import FeedsLeftBar from "./feedleftbar";
import PLCStream from "./PLCStream";
import LoadingScreen from "@/components/LoadingScreen";
import BackgroundGradient from "@/components/BackgroundGradient";

export default function FeedsContent() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUserDetails().then(setUser);
  }, []);

  if (!user) return <LoadingScreen />;

  return (
    <div className="relative min-h-screen">
      <BackgroundGradient />
      <HomepageTab user={user} />
      <FeedsLeftBar user={user} />

      <div className="ml-[350px] pt-[100px] pb-20 flex flex-col items-center min-h-screen">
        <div className="animate-fadeIn w-full flex justify-center">
          <PLCStream />
        </div>
      </div>
    </div>
  );
}

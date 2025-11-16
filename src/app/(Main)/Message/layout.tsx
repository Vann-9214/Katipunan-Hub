"use client";

import ChatSidebar from "@/app/component/General/Message/Sidebar/sidebar";
import HomepageTab from "@/app/component/ReusableComponent/HomepageTab/HomepageTab";
import { useState, useEffect } from "react";
import { getCurrentUserDetails } from "../../../../supabase/Lib/General/getUser";
import type { User } from "../../../../supabase/Lib/General/user";

export default function MessageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 5. Add state for user
  const [user, setUser] = useState<User | null>(null);

  // 6. Add effect to fetch user
  useEffect(() => {
    const loadUser = async () => {
      const userDetails = await getCurrentUserDetails();
      setUser(userDetails);
    };
    loadUser();
  }, []);

  return (
    <div>
      {/* 1. The header (fixed to top) */}
      <HomepageTab user={user} />

      {/* 2. The main chat UI container */}
      <div className="flex h-screen w-full pt-[80px]">
        {/* COLUMN 1: Your sidebar */}
        <ChatSidebar />

        {/* COLUMN 2: The content (your page) */}
        <main className="flex-1 h-full bg-white">{children}</main>
      </div>
    </div>
  );
}

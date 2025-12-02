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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userDetails = await getCurrentUserDetails();
      setUser(userDetails);
    };
    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F4F7]">
      {/* 1. The header (fixed to top) */}
      <HomepageTab user={user} />

      {/* 2. The main chat UI container */}
      {/* ADDED: Padding and Gap for the "Card" look */}
      <div className="flex h-screen w-full pt-[100px] pb-6 px-6 gap-6 box-border overflow-hidden">
        {/* COLUMN 1: Your sidebar */}
        <div className="h-full flex-shrink-0">
          <ChatSidebar />
        </div>

        {/* COLUMN 2: The content (your page) */}
        <main className="flex-1 h-full min-w-0 relative">{children}</main>
      </div>
    </div>
  );
}

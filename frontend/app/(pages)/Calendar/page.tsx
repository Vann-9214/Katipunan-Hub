"use client";

import CalendarContent from "@/features/Calendar/CalendarContent";
import HomepageTab from "@/components/HomepageTab";
import { useState, useEffect } from "react";
import { getCurrentUserDetails } from "@/database/supabase/General/getUser";
import type { User } from "@/database/supabase/General/user";

export default function Calendar() {
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
      <CalendarContent />
    </div>
  );
}

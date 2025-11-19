"use client";

/* Header */
import HomepageTab from "@/app/component/ReusableComponent/HomepageTab/HomepageTab";
import { useState, useEffect } from "react";
import { getCurrentUserDetails } from "../../../../supabase/Lib/General/getUser";
import type { User } from "../../../../supabase/Lib/General/user";

/* Components */
import PLCContent from "@/app/component/General/PLC/PLCContent";

export default function PLC() {
  /* State */
  const [user, setUser] = useState<User | null>(null);

  /* Effects */
  useEffect(() => {
    const loadUser = async () => {
      const userDetails = await getCurrentUserDetails();
      setUser(userDetails);
    };
    loadUser();
  }, []);

  /* Render */
  return (
    <div className="min-h-screen bg-white">
      <HomepageTab user={user} />
      <div className="pt-[90px] px-[50px] pb-10">
        <PLCContent />
      </div>
    </div>
  );
}

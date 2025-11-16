"use client";

// Imports
import HomepageTab from "@/app/component/ReusableComponent/HomepageTab/HomepageTab";
import { useState, useEffect } from "react";
import { getCurrentUserDetails } from "../../../../supabase/Lib/General/getUser";
import type { User } from "../../../../supabase/Lib/General/user";

// Component
export default function LostandFound() {
  // State
  const [user, setUser] = useState<User | null>(null);

  // Data Fetching
  useEffect(() => {
    const loadUser = async () => {
      const userDetails = await getCurrentUserDetails();
      setUser(userDetails);
    };
    loadUser();
  }, []);

  // Render
  return (
    <div className="p-[25px]">
      <HomepageTab user={user} />
      <h1 className="font-bold font-montserrat text-[32px] text-maroon mt-[160px] mb-[15px]">
        Lost and Found
      </h1>
    </div>
  );
}

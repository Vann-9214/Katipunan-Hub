"use client"; // 1. Convert to client component

import HomepageTab from "@/app/component/ReusableComponent/HomepageTab/HomepageTab";
import { useState, useEffect } from "react"; // 2. Import hooks
import { getCurrentUserDetails } from "../../../../supabase/Lib/General/getUser"; // 3. Import user fetcher
import type { User } from "../../../../supabase/Lib/General/user"; // 4. Import user type

export default function Feeds() {
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
    <div className="p-[25px]">
      <HomepageTab user={user} />
      <h1 className="font-bold font-montserrat text-[32px] text-maroon mt-[160px] mb-[15px]">
        Feeds
      </h1>
    </div>
  );
}

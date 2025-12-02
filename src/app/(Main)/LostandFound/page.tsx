"use client";

import HomepageTab from "@/app/component/ReusableComponent/HomepageTab/HomepageTab";
import LostAndFoundContent from "@/app/component/General/LostandFound/LostandFoundcontent";
import { useState, useEffect } from "react";
// Keep backend imports for your leader
import { getCurrentUserDetails } from "../../../../supabase/Lib/General/getUser";
import type { User } from "../../../../supabase/Lib/General/user";

export default function LostandFoundPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userDetails = await getCurrentUserDetails();
        if (userDetails) {
          setUser(userDetails);
        } else {
          throw new Error("No user returned");
        }
      } catch (error: unknown) {
        /**
         * Error Handling Section
         * Logs the error to console.
         * Uses 'as unknown as User' to force the partial dummy object into the User type
         * bypassing the missing property errors.
         */
        console.warn("Backend not connected. Using Dummy User.", error);

        setUser({
          id: "123",
          name: "Test User",
          email: "test@school.edu",
        } as unknown as User);
      }
    };
    loadUser();
  }, []);

  return (
    <div className="w-full">
      <div className="fixed top-0 left-0 w-full z-50">
        <HomepageTab user={user} />
      </div>
      <LostAndFoundContent user={user} />
    </div>
  );
}

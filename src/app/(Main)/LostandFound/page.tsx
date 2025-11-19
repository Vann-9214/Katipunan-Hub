"use client";

// Imports
import HomepageTab from "@/app/component/ReusableComponent/HomepageTab/HomepageTab";
import LostAndFoundContent from "@/app/component/General/LostandFound/LostandFoundcontent"; 
import { useState, useEffect } from "react";
import { getCurrentUserDetails } from "../../../../supabase/Lib/General/getUser";
import type { User } from "../../../../supabase/Lib/General/user";

// Component
export default function LostandFoundPage() {
  // 1. Create state to hold the user data
  const [user, setUser] = useState<User | null>(null);

  // 2. Fetch the user data when the page loads
  useEffect(() => {
    const loadUser = async () => {
      const userDetails = await getCurrentUserDetails();
      setUser(userDetails);
    };
    loadUser();
  }, []);

  // 3. Pass the 'user' variable to HomepageTab
  return (
    <div className="p-[25px]">
      <HomepageTab user={user} /> 
      
      {/* Your main content */}
      <h1 className="font-bold font-montserrat text-[32px] text-maroon mt-[160px] mb-[15px]">
        Lost and Found
      </h1>
      <LostAndFoundContent />
    </div>
  );
}
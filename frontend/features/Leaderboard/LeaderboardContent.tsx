"use client";

import { useState, useEffect } from "react";
import { getCurrentUserDetails } from "@/database/supabase/General/getUser";
import type { User } from "@/database/supabase/General/user";
import HomepageTab from "@/components/HomepageTab";
import LoadingScreen from "@/components/LoadingScreen";
import BackgroundGradient from "@/components/BackgroundGradient";
import TutorLeaderboard from "./TutorLeaderboard";
import { Trophy, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LeaderboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    getCurrentUserDetails()
      .then((u) => {
        if (isMounted) {
          if (!u) {
            router.push("/");
            return;
          }
          setUser(u);
        }
      })
      .catch((err) => {
        console.error("Auth error in Leaderboard:", err);
        if (isMounted) router.push("/");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading || !user) return <LoadingScreen />;

  return (
    <div className="relative min-h-screen pb-20">
      <BackgroundGradient />
      <HomepageTab user={user} />

      <div className="max-w-[700px] mx-auto pt-[100px] px-4 flex flex-col items-center">
        {/* Page Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFBF04]/10 border border-[#EFBF04]/30 text-[#8B0E0E] font-bold text-xs uppercase tracking-widest mb-3">
            <Trophy size={14} className="text-[#EFBF04]" />
            <span>Peer Learning Center</span>
            <Sparkles size={14} className="text-[#EFBF04]" />
          </div>
          <h1 className="font-montserrat font-extrabold text-[28px] md:text-[34px] text-gray-900 leading-tight">
            Tutor <span className="text-[#8B0E0E]">Hall of Fame</span>
          </h1>
          <p className="font-ptsans text-gray-600 text-sm md:text-base mt-1 max-w-md mx-auto">
            Celebrating our top-rated peer tutors and verified student feedback.
          </p>
        </motion.div>

        {/* Leaderboard Feed */}
        <div className="w-full flex justify-center">
          <TutorLeaderboard />
        </div>
      </div>
    </div>
  );
}

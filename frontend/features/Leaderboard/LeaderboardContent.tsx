"use client";

import HomepageTab from "@/components/HomepageTab";
import LoadingScreen from "@/components/LoadingScreen";
import BackgroundGradient from "@/components/BackgroundGradient";
import LeaderboardBanner from "./components/LeaderboardBanner";
import TutorLeaderboard from "./components/TutorLeaderboard";
import { useLeaderboardUser } from "./hooks/useLeaderboardUser";

export default function LeaderboardContent() {
  const { user, loading } = useLeaderboardUser();

  if (loading || !user) return <LoadingScreen />;

  return (
    <div className="relative min-h-screen pb-20">
      <BackgroundGradient />
      <HomepageTab user={user} />

      <div className="max-w-[700px] mx-auto pt-[100px] px-4 flex flex-col items-center">
        <LeaderboardBanner />
        <div className="w-full flex justify-center">
          <TutorLeaderboard />
        </div>
      </div>
    </div>
  );
}

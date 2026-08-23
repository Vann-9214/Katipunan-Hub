import { Suspense } from "react";
import LeaderboardContent from "@/features/Leaderboard/LeaderboardContent";
import LoadingScreen from "@/components/LoadingScreen";

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LeaderboardContent />
    </Suspense>
  );
}

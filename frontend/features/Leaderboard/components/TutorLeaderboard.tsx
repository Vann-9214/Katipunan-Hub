"use client";

import { useLeaderboard } from "../hooks/useLeaderboard";
import LeaderboardLoading from "./LeaderboardLoading";
import LeaderboardEmptyState from "./LeaderboardEmptyState";
import LeaderboardHeaderBadge from "./LeaderboardHeaderBadge";
import LeaderboardCard from "./LeaderboardCard";

export default function TutorLeaderboard() {
  const { items, loading } = useLeaderboard();

  if (loading) return <LeaderboardLoading />;
  if (items.length === 0) return <LeaderboardEmptyState />;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[540px] pb-12">
      <LeaderboardHeaderBadge />
      {items.map((item) => (
        <LeaderboardCard key={item.id} item={item} />
      ))}
    </div>
  );
}

import { Crown } from "lucide-react";

export default function LeaderboardHeaderBadge() {
  return (
    <div className="flex items-center gap-2 mb-2 px-5 py-2.5 bg-white/90 border border-[#EFBF04]/40 rounded-full shadow-[0_8px_32px_rgba(239,191,4,0.15)] sticky top-24 z-30 backdrop-blur-xl transition-all hover:scale-105 cursor-default">
      <Crown
        size={18}
        className="text-[#EFBF04] fill-[#EFBF04] animate-pulse"
      />
      <h2 className="font-bold text-xs sm:text-sm text-[#8B0E0E] font-montserrat tracking-widest uppercase">
        Tutor Leaderboard
      </h2>
      <Crown
        size={18}
        className="text-[#EFBF04] fill-[#EFBF04] animate-pulse"
      />
    </div>
  );
}

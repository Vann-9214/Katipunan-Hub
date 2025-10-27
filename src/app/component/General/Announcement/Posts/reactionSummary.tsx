// components/Posts/ReactionSummary.tsx
"use client";

import Image from "next/image";
import { formatCompactNumber } from "./General/FormatNumber";
// --- 1. Import your helper function ---
import { getReactionIcon } from "./General/config";
import { ReactionCount } from "../../../../../../supabase/Lib/Announcement/Posts/usePostReaction";

interface ReactionSummaryProps {
  topReactions: ReactionCount[];
  totalCount: number | null;
  isLoading: boolean;
}

export default function ReactionSummary({
  topReactions,
  totalCount,
  isLoading,
}: ReactionSummaryProps) {
  if (isLoading) {
    return (
      <div className="h-[23px] w-[40px] bg-gray-500 rounded-md animate-pulse" />
    );
  }

  const formattedCount = formatCompactNumber(totalCount);

  if (totalCount === 0 || totalCount === null) {
    return;
  }

  const topThree = topReactions.slice(0, 3);

  return (
    <div className="flex items-center gap-1 group">
      {/* Emojis */}
      {topThree.length > 0 && (
        <div className="flex items-center select-none">
          {topThree.map(({ reaction }) => {
            // --- 2. Use your helper function ---
            // 'reaction' here is the ID string, e.g., "like", "love"
            const icon = getReactionIcon(reaction);

            return (
              <Image
                key={reaction}
                src={icon}
                alt={reaction}
                width={23}
                height={23}
                className="-ml-1 first:ml-0"
              />
            );
          })}
        </div>
      )}

      {/* Count */}
      <span className="text-black font-ptsans text-[20px]">
        {formattedCount}
      </span>
    </div>
  );
}

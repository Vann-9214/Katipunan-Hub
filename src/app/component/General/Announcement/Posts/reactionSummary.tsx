"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { createPortal } from "react-dom"; // Import Portal to fix cutoff
import { formatCompactNumber } from "./Utils/FormatNumber";
import { getReactionIcon } from "./Utils/config";
import { ReactionCount } from "../../../../../../supabase/Lib/Announcement/Posts/usePostReaction";
import { useReactionUsers, ReactionSourceType } from "./useReactionUser";
import { motion, AnimatePresence } from "framer-motion";

interface ReactionSummaryProps {
  topReactions: ReactionCount[];
  totalCount: number | null;
  isLoading: boolean;
  referenceId?: string;
  sourceType?: ReactionSourceType;
}

export default function ReactionSummary({
  topReactions,
  totalCount,
  isLoading,
  referenceId,
  sourceType = "post",
}: ReactionSummaryProps) {
  const [isHovered, setIsHovered] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ left: 0, bottom: 0 });
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const { users, isLoading: isLoadingUsers } = useReactionUsers(
    referenceId || "",
    sourceType,
    isHovered,
    totalCount
  );

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);

    // Calculate position so it floats FIXED on the screen (avoids clipping)
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        left: rect.left,
        // Position popup 5px above the trigger element
        bottom: window.innerHeight - rect.top + 5,
      });
    }

    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setIsHovered(false);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="h-[23px] w-[40px] bg-gray-200 rounded-md animate-pulse" />
    );
  }

  const formattedCount = formatCompactNumber(totalCount);

  if (totalCount === 0 || totalCount === null) {
    return null;
  }

  const topThree = topReactions.slice(0, 3);

  // The popup content itself
  const popupContent = (
    <AnimatePresence>
      {isHovered && referenceId && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed", // Fixed prevents it from being clipped by parent overflow
            left: coords.left,
            bottom: coords.bottom,
            zIndex: 9999, // Ensure it sits on top of everything
          }}
          // --- THEME UPDATE: Soft Cream Background + Gold Border ---
          className="w-[240px] bg-[#FFFDF5] rounded-xl shadow-xl border border-[#EFBF04]/30 overflow-hidden pointer-events-auto"
          onMouseEnter={() => {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
          }}
          onMouseLeave={handleMouseLeave}
        >
          {/* Header: Slightly darker cream */}
          <div className="bg-[#FFF9E5] px-4 py-2 border-b border-[#EFBF04]/10">
            <p className="text-xs font-bold text-[#B48E00] uppercase tracking-wide">
              Reactions
            </p>
          </div>

          {/* User List */}
          {/* You can adjust max-h-[250px] here to change height */}
          <div className="flex flex-col gap-2 p-3 max-h-[250px] overflow-y-auto custom-scrollbar">
            {isLoadingUsers ? (
              <div className="py-4 text-center text-xs text-gray-400 font-montserrat">
                Loading...
              </div>
            ) : users.length > 0 ? (
              users.map((u, idx) => (
                <div
                  key={`${u.user.id}-${idx}`}
                  className="flex items-center gap-3 hover:bg-[#EFBF04]/5 p-1 rounded-lg transition-colors"
                >
                  <div className="relative w-6 h-6 shrink-0">
                    <Image
                      src={u.user.avatarURL || "/DefaultAvatar.svg"}
                      alt="User"
                      fill
                      className="rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                      <Image
                        src={getReactionIcon(u.reaction)}
                        alt={u.reaction}
                        width={10}
                        height={10}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate font-montserrat">
                    {u.user.fullName}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-2 text-center text-xs text-gray-400 font-ptsans">
                No users found.
              </div>
            )}
          </div>

          {/* Visual Arrow (Matches BG) */}
          <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-[#FFFDF5] border-b border-r border-[#EFBF04]/30 rotate-45" />
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div
        ref={triggerRef}
        className="relative flex items-center gap-1 group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Emojis */}
        {topThree.length > 0 && (
          <div className="flex items-center select-none">
            {topThree.map(({ reaction }) => {
              const icon = getReactionIcon(reaction);
              return (
                <Image
                  key={reaction}
                  src={icon}
                  alt={reaction}
                  width={23}
                  height={23}
                  className="-ml-1 first:ml-0 z-10 relative"
                />
              );
            })}
          </div>
        )}

        {/* Count */}
        <span className="text-black font-ptsans text-[20px] hover:underline decoration-gray-400 underline-offset-2">
          {formattedCount}
        </span>
      </div>

      {/* Render Portal outside the DOM hierarchy to escape overflow-hidden */}
      {typeof document !== "undefined" &&
        createPortal(popupContent, document.body)}
    </>
  );
}

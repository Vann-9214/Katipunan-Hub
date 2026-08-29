"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  formatCompactNumber,
  getReactionIcon,
} from "../utils/reactionsConfig";
import { ReactionCount } from "../hooks/usePostReactions";
import { useReactionUsers } from "../hooks/useReactionUsers";
import { motion, AnimatePresence } from "framer-motion";

interface ReactionSummaryProps {
  topReactions: ReactionCount[];
  totalCount: number | null;
  isLoading?: boolean;
  postId?: string;
  theme?: "dark" | "light";
}

export default function ReactionSummary({
  topReactions,
  totalCount,
  isLoading = false,
  postId,
  theme = "dark",
}: ReactionSummaryProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ left: 0, bottom: 0 });
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { users, isLoading: isLoadingUsers } = useReactionUsers(
    postId || "",
    isHovered,
    totalCount
  );

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);

    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        left: Math.max(16, rect.left),
        bottom: window.innerHeight - rect.top + 6,
      });
    }

    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setIsHovered(false);
    }, 250);
  };

  if (isLoading) {
    return (
      <div className="h-5 w-12 bg-white/20 rounded-md animate-pulse" />
    );
  }

  if (totalCount === null || totalCount === 0) {
    return null;
  }

  const formattedCount = formatCompactNumber(totalCount);
  const topThree = topReactions.slice(0, 3);

  const popupContent = (
    <AnimatePresence>
      {isHovered && postId && (
        <motion.div
          key={`reaction-summary-popup-${postId}`}
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            left: coords.left,
            bottom: coords.bottom,
            zIndex: 99999,
          }}
          className="w-[230px] bg-[#2a0404]/95 backdrop-blur-md rounded-xl shadow-2xl border border-[#EFBF04]/40 overflow-hidden pointer-events-auto"
          onMouseEnter={() => {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
          }}
          onMouseLeave={handleMouseLeave}
        >
          {/* Header */}
          <div className="bg-[#3d0606] px-3.5 py-2 border-b border-[#EFBF04]/20 flex items-center justify-between">
            <p className="text-xs font-bold text-[#EFBF04] font-montserrat uppercase tracking-wider">
              Reactions ({totalCount})
            </p>
          </div>

          {/* User List */}
          <div className="flex flex-col gap-1 p-2.5 max-h-[220px] overflow-y-auto custom-scrollbar">
            {isLoadingUsers ? (
              <div className="py-4 text-center text-xs text-white/50 font-ptsans">
                Loading...
              </div>
            ) : users.length > 0 ? (
              users.map((u, idx) => (
                <div
                  key={`${u.user.id}-${idx}`}
                  className="flex items-center gap-2.5 hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                >
                  <div className="relative w-6 h-6 shrink-0">
                    <Image
                      src={u.user.avatarURL || "/DefaultAvatar.svg"}
                      alt={u.user.fullName}
                      fill
                      className="rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-black/80 rounded-full flex items-center justify-center shadow-sm">
                      <Image
                        src={getReactionIcon(u.reaction)}
                        alt={u.reaction}
                        width={10}
                        height={10}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-white/90 truncate font-montserrat">
                    {u.user.fullName}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-2 text-center text-xs text-white/40 font-ptsans">
                No users found.
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div
        ref={triggerRef}
        className="relative flex items-center gap-1.5 group cursor-pointer select-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Top Reactions Emojis */}
        {topThree.length > 0 && (
          <div className="flex items-center">
            {topThree.map(({ reaction }, idx) => {
              const icon = getReactionIcon(reaction);
              return (
                <div
                  key={reaction}
                  className="relative -ml-1.5 first:ml-0 rounded-full bg-black/40 p-0.5"
                  style={{ zIndex: 10 - idx }}
                >
                  <Image
                    src={icon}
                    alt={reaction}
                    width={18}
                    height={18}
                    className="drop-shadow"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Reaction Count Number */}
        <span
          className={`font-ptsans text-xs font-semibold ${
            theme === "dark" ? "text-white/80" : "text-gray-700"
          } group-hover:underline`}
        >
          {formattedCount}
        </span>
      </div>

      {mounted &&
        typeof document !== "undefined" &&
        createPortal(popupContent, document.body)}
    </>
  );
}

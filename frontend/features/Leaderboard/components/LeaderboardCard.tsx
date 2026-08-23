"use client";

import { PLCHighlight } from "@/database/supabase/Leaderboard";
import Avatar from "@/components/Avatar";
import { Star, Quote, Award } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getLeaderboardTheme } from "../utils/getLeaderboardTheme";

interface LeaderboardCardProps {
  item: PLCHighlight;
}

export default function LeaderboardCard({ item }: LeaderboardCardProps) {
  const rating = item.rating;
  const theme = getLeaderboardTheme(rating);

  return (
    <motion.div
      initial={{ opacity: 0.5, scale: 0.95 }}
      whileInView={{
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4 },
      }}
      whileHover={{
        y: -4,
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      className={`w-full rounded-[20px] border ${theme.border} ${theme.bg} ${theme.shadow} p-5 relative overflow-hidden transition-all duration-300 group cursor-default`}
    >
      {theme.glow}

      <div className="flex items-start gap-4 relative z-10">
        <Link
          href={`/Profile/${item.tutorId}`}
          className="relative group/avatar cursor-pointer shrink-0"
        >
          <div
            className={`p-[2px] rounded-full ${theme.ring} shadow-sm transition-transform duration-300 group-hover/avatar:scale-105`}
          >
            <Avatar
              avatarURL={item.tutorAvatar}
              altText={item.tutorName}
              className="w-12 h-12 border-2 border-white rounded-full bg-white object-cover"
            />
          </div>
          {rating === 5 && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md border border-[#EFBF04]/20">
              <Award
                size={12}
                className="text-[#EFBF04] fill-[#EFBF04]"
              />
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex flex-col min-w-0 pr-1">
              <Link
                href={`/Profile/${item.tutorId}`}
                className="text-[15px] font-bold text-[#1a1a1a] font-montserrat hover:text-[#8B0E0E] transition-colors truncate tracking-tight"
              >
                {item.tutorName}
              </Link>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${theme.badge} truncate max-w-[150px]`}
                >
                  {item.subject}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border shrink-0 bg-white/80 shadow-xs">
              <Star size={13} className={theme.iconColor} />
              <span
                className={`text-sm font-extrabold font-montserrat ${theme.textAccent}`}
              >
                {rating.toFixed(1)}
              </span>
            </div>
          </div>

          {item.review && (
            <div className="mt-3 relative">
              <Quote
                size={14}
                className={`absolute -top-1.5 -left-1 opacity-15 ${theme.textAccent}`}
              />
              <div className="pl-3.5 border-l-2 border-amber-200/60 ml-0.5">
                <p className="font-ptsans text-[13px] italic leading-relaxed text-gray-600 line-clamp-3">
                  &quot;{item.review}&quot;
                </p>
              </div>
              <div className="flex items-center justify-end gap-1 mt-1.5 opacity-70">
                <span className="text-[10px] font-medium text-gray-500">
                  — {item.studentName}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

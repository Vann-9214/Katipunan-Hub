"use client";

import { useEffect, useState } from "react";
import { getPLCHighlights } from "@/database/supabase/PLC/tutorLeaderboard";
import { PLCHighlight } from "@/database/supabase/PLC/leaderboardTypes";
import Avatar from "@/components/Avatar";
import { Star, Quote, Award, Crown, Loader2 } from "lucide-react";
import { supabase } from "@/database/supabase/General/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";

export default function TutorLeaderboard() {
  const [items, setItems] = useState<PLCHighlight[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHighlights = async () => {
    try {
      const data = await getPLCHighlights();
      setItems(data || []);
    } catch (err) {
      console.error("Error fetching leaderboard highlights:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlights();

    const channel = supabase
      .channel(`plc-leaderboard-realtime_${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "TutorRatings" },
        () => {
          fetchHighlights();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading)
    return (
      <div className="py-12 flex flex-col items-center justify-center w-full gap-2">
        <Loader2 className="animate-spin text-[#8B0E0E]" size={28} />
        <span className="text-xs font-montserrat text-gray-500 font-semibold">
          Loading Hall of Fame...
        </span>
      </div>
    );

  if (items.length === 0) {
    return (
      <div className="w-full max-w-[500px] bg-white rounded-[20px] border border-gray-200 p-8 text-center flex flex-col items-center shadow-sm">
        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-300">
          <Award size={28} />
        </div>
        <h3 className="text-base font-bold text-gray-700 font-montserrat">
          Hall of Fame Empty
        </h3>
        <p className="text-gray-500 text-xs font-ptsans mt-1">
          No tutor ratings or reviews recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[540px] pb-12">
      {/* Header Badge */}
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

      {/* List */}
      {items.map((item) => {
        const rating = item.rating;

        // Visual Tiers
        let theme = {
          border: "border-gray-100",
          bg: "bg-white",
          shadow: "shadow-sm hover:shadow-md",
          ring: "bg-gray-100",
          textAccent: "text-gray-400",
          iconColor: "text-gray-300",
          badge: "bg-gray-50 text-gray-400 border-gray-100",
          reviewBorder: "border-gray-100",
          glow: null as React.ReactNode,
        };

        if (rating === 5) {
          theme = {
            border: "border-[#EFBF04]/60",
            bg: "bg-gradient-to-br from-[#FFFEF9] to-[#FFFBF0]",
            shadow:
              "shadow-[0_10px_40px_-12px_rgba(239,191,4,0.4)] hover:shadow-[0_20px_50px_-12px_rgba(239,191,4,0.5)]",
            ring: "bg-gradient-to-tr from-[#F59E0B] via-[#EFBF04] to-[#FCE788]",
            textAccent: "text-[#B48E00]",
            iconColor: "text-[#EFBF04] fill-[#EFBF04]",
            badge: "bg-[#FFF9E5] text-[#B48E00] border-[#EFBF04]/30",
            reviewBorder: "border-[#EFBF04]/20",
            glow: (
              <>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#EFBF04]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none z-20" />
              </>
            ),
          };
        } else if (rating >= 4.0) {
          theme = {
            border: "border-slate-300",
            bg: "bg-gradient-to-br from-[#F8FAFC] to-white",
            shadow: "shadow-sm hover:shadow-lg hover:shadow-slate-200/50",
            ring: "bg-gradient-to-tr from-slate-400 to-slate-200",
            textAccent: "text-slate-600",
            iconColor: "text-slate-400 fill-slate-400",
            badge: "bg-slate-50 text-slate-600 border-slate-200",
            reviewBorder: "border-slate-200",
            glow: (
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-slate-400/5 rounded-full blur-2xl pointer-events-none" />
            ),
          };
        } else if (rating >= 3.0) {
          theme = {
            border: "border-orange-200/60",
            bg: "bg-[#FFFBF7]",
            shadow: "shadow-sm hover:shadow-md hover:shadow-orange-100",
            ring: "bg-[#D4A373]",
            textAccent: "text-[#A98467]",
            iconColor: "text-[#D4A373]",
            badge: "bg-[#FAF5F0] text-[#A98467] border-orange-100",
            reviewBorder: "border-orange-100",
            glow: null,
          };
        }

        return (
          <motion.div
            key={item.id}
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
      })}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getPLCHighlights } from "../../../../../supabase/Lib/Feeds/feeds";
import { PLCHighlight } from "../../../../../supabase/Lib/Feeds/types";
import Avatar from "@/app/component/ReusableComponent/Avatar";
import { Star, Quote, Award, Crown } from "lucide-react";
import LoadingScreen from "@/app/component/ReusableComponent/LoadingScreen";
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PLCStream() {
  const [items, setItems] = useState<PLCHighlight[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHighlights = async () => {
    const data = await getPLCHighlights();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHighlights();

    const channel = supabase
      .channel("plc-highlights-realtime")
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
      <div className="mt-140">
        <LoadingScreen />
      </div>
    );

  if (items.length === 0) {
    return (
      <div className="w-full max-w-[600px] bg-white rounded-[20px] border border-gray-200 p-6 text-center flex flex-col items-center shadow-sm mt-2">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2 text-gray-300">
          <Award size={24} />
        </div>
        <h3 className="text-sm font-bold text-gray-700 font-montserrat">
          Hall of Fame Empty
        </h3>
        <p className="text-gray-500 text-xs font-ptsans mt-1">
          No ratings yet. Be the first!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-[600px] pb-12 px-6">
      {/* Header - Glassmorphism floating badge */}
      <div className="flex items-center gap-2 mb-1 px-5 py-2 bg-white/80 border border-[#EFBF04]/40 rounded-full shadow-[0_8px_32px_rgba(239,191,4,0.15)] sticky top-4 z-50 backdrop-blur-xl transition-all hover:scale-105 cursor-default">
        <Crown
          size={16}
          className="text-[#EFBF04] fill-[#EFBF04] animate-pulse"
        />
        <h2 className="font-bold text-sm text-[#8B0E0E] font-montserrat tracking-widest uppercase">
          Tutor Hall of Fame
        </h2>
        <Crown
          size={16}
          className="text-[#EFBF04] fill-[#EFBF04] animate-pulse"
        />
      </div>

      {/* List */}
      {items.map((item) => {
        const rating = item.rating;

        // --- 1. DEFINE VISUAL TIERS ---
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
          // --- 5 STARS: LEGENDARY (Gold, Shimmering, Glowing) ---
          theme = {
            border: "border-[#EFBF04]/60",
            bg: "bg-gradient-to-br from-[#FFFEF9] to-[#FFFBF0]", // Warm Subtle Gold Tint
            shadow:
              "shadow-[0_10px_40px_-12px_rgba(239,191,4,0.4)] hover:shadow-[0_20px_50px_-12px_rgba(239,191,4,0.5)]",
            ring: "bg-gradient-to-tr from-[#F59E0B] via-[#EFBF04] to-[#FCE788]", // Gold Gradient Ring
            textAccent: "text-[#B48E00]",
            iconColor: "text-[#EFBF04] fill-[#EFBF04]",
            badge: "bg-[#FFF9E5] text-[#B48E00] border-[#EFBF04]/30",
            reviewBorder: "border-[#EFBF04]/20",
            glow: (
              <>
                {/* Ambient Background Glow */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#EFBF04]/10 rounded-full blur-3xl pointer-events-none" />
                {/* Shimmer Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none z-20" />
              </>
            ),
          };
        } else if (rating >= 4.0) {
          // --- 4 STARS: ELITE (Silver/Platinum, Cool & Crisp) ---
          theme = {
            border: "border-slate-300",
            bg: "bg-gradient-to-br from-[#F8FAFC] to-white", // Cool Slate Tint
            shadow: "shadow-sm hover:shadow-lg hover:shadow-slate-200/50",
            ring: "bg-gradient-to-tr from-slate-400 to-slate-200", // Silver Gradient
            textAccent: "text-slate-600",
            iconColor: "text-slate-400 fill-slate-400",
            badge: "bg-slate-50 text-slate-600 border-slate-200",
            reviewBorder: "border-slate-200",
            glow: (
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-400/5 rounded-full blur-2xl pointer-events-none" />
            ),
          };
        } else if (rating >= 3.0) {
          // --- 3 STARS: STANDARD (Bronze, Warm, Earthy) ---
          theme = {
            border: "border-orange-200/60",
            bg: "bg-[#FFFBF7]", // Very faint warm tint
            shadow: "shadow-sm hover:shadow-md hover:shadow-orange-100",
            ring: "bg-[#D4A373]", // Flat Bronze
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
            initial={{ opacity: 0.5, scale: 0.9, y: 40 }}
            whileInView={{
              opacity: 1,
              scale: rating === 5 ? 1.05 : 1, // Only Legends pop out bigger
              y: 0,
              zIndex: rating === 5 ? 20 : 1,
              transition: { duration: 0.6, type: "spring", bounce: 0.3 },
            }}
            viewport={{ margin: "-20% 0px -20% 0px" }}
            whileHover={{
              y: -8, // LIFT EFFECT
              scale: rating === 5 ? 1.07 : 1.02,
              transition: { duration: 0.3, ease: "easeOut" },
            }}
            className={`w-full rounded-[24px] border ${theme.border} ${theme.bg} ${theme.shadow} p-5 relative overflow-hidden transition-all duration-300 group cursor-default`}
          >
            {/* Visual Effects */}
            {theme.glow}

            <div className="flex items-start gap-4 relative z-10">
              {/* Avatar */}
              <Link
                href={`/Profile/${item.tutorId}`}
                className="relative group/avatar cursor-pointer shrink-0"
              >
                <div
                  className={`p-[3px] rounded-full ${theme.ring} shadow-sm transition-transform duration-300 group-hover/avatar:scale-105`}
                >
                  <Avatar
                    avatarURL={item.tutorAvatar}
                    altText={item.tutorName}
                    className="w-14 h-14 border-[3px] border-white rounded-full bg-white object-cover"
                  />
                </div>
                {/* 5-Star Badge Icon */}
                {rating === 5 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md border border-[#EFBF04]/20"
                  >
                    <Award
                      size={12}
                      className="text-[#EFBF04] fill-[#EFBF04]"
                    />
                  </motion.div>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                {/* Header Info */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <Link
                      href={`/Profile/${item.tutorId}`}
                      className="text-[18px] font-bold text-[#1a1a1a] font-montserrat hover:text-[#8B0E0E] transition-colors truncate tracking-tight group-hover:translate-x-1 duration-300"
                    >
                      {item.tutorName}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] font-bold px-3 py-0.5 rounded-full border uppercase tracking-wider transition-colors ${theme.badge}`}
                      >
                        {item.subject}
                      </span>
                    </div>
                  </div>

                  {/* Rating Pill */}
                  <div className="flex flex-col items-end">
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border ${theme.badge} backdrop-blur-md shadow-sm group-hover:scale-105 transition-transform`}
                    >
                      <Star size={13} className={theme.iconColor} />
                      <span
                        className={`text-sm font-extrabold font-montserrat ${theme.textAccent}`}
                      >
                        {rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1.5 font-medium font-ptsans opacity-80">
                      {new Date(item.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Review Text */}
                {item.review ? (
                  <div className="mt-4 relative transition-transform duration-300 group-hover:translate-x-1">
                    <Quote
                      size={24}
                      className={`absolute -top-2 -left-2 opacity-10 ${theme.textAccent}`}
                    />
                    <div
                      className={`pl-4 border-l-2 ${theme.reviewBorder} ml-1`}
                    >
                      <p
                        className={`font-ptsans text-[14px] italic leading-relaxed line-clamp-3 ${
                          rating < 3 ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        &quot;{item.review}&quot;
                      </p>
                    </div>

                    {/* Signature */}
                    <div className="flex items-center justify-end gap-1.5 mt-2.5 opacity-70">
                      <span className="text-[10px] uppercase font-bold text-gray-400">
                        Review by
                      </span>
                      <span className="text-[11px] font-bold text-gray-600">
                        {item.studentName}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-[11px] text-gray-300 italic pl-3 border-l-2 border-gray-100">
                    No written review provided.
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

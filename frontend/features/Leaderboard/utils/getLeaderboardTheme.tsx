import React from "react";

export interface LeaderboardTheme {
  border: string;
  bg: string;
  shadow: string;
  ring: string;
  textAccent: string;
  iconColor: string;
  badge: string;
  reviewBorder: string;
  glow: React.ReactNode;
}

export function getLeaderboardTheme(rating: number): LeaderboardTheme {
  if (rating === 5) {
    return {
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
  }

  if (rating >= 4.0) {
    return {
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
  }

  if (rating >= 3.0) {
    return {
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

  return {
    border: "border-gray-100",
    bg: "bg-white",
    shadow: "shadow-sm hover:shadow-md",
    ring: "bg-gray-100",
    textAccent: "text-gray-400",
    iconColor: "text-gray-300",
    badge: "bg-gray-50 text-gray-400 border-gray-100",
    reviewBorder: "border-gray-100",
    glow: null,
  };
}

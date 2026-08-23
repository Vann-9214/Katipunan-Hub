"use client";

import { Trophy, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function LeaderboardBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full text-center mb-6"
    >
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFBF04]/10 border border-[#EFBF04]/30 text-[#8B0E0E] font-bold text-xs uppercase tracking-widest mb-3">
        <Trophy size={14} className="text-[#EFBF04]" />
        <span>Peer Learning Center</span>
        <Sparkles size={14} className="text-[#EFBF04]" />
      </div>
      <h1 className="font-montserrat font-extrabold text-[28px] md:text-[34px] text-gray-900 leading-tight">
        Tutor <span className="text-[#8B0E0E]">Hall of Fame</span>
      </h1>
      <p className="font-ptsans text-gray-600 text-sm md:text-base mt-1 max-w-md mx-auto">
        Celebrating our top-rated peer tutors and verified student feedback.
      </p>
    </motion.div>
  );
}

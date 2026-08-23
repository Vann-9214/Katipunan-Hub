"use client";

import React from "react";
import {
  Calendar as CalendarIcon,
  LayoutGrid,
  History,
  GraduationCap,
} from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import { motion } from "framer-motion";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

interface PLCHeaderProps {
  viewMode: "year" | "month";
  onViewModeChange: (mode: "year" | "month") => void;
  onHistoryClick: () => void;
}

export default function PLCHeader({
  viewMode,
  onViewModeChange,
  onHistoryClick,
}: PLCHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      {/* Title Area */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center gap-4"
      >
        <div className="p-3 bg-gradient-to-br from-[#8B0E0E] to-[#5e0a0a] rounded-2xl shadow-lg shadow-red-900/20 text-white">
          <GraduationCap size={32} />
        </div>
        <div>
          <h1
            className={`${montserrat.className} text-[28px] md:text-[32px] font-extrabold text-[#1a1a1a] leading-tight`}
          >
            Peer Learning Center
          </h1>
          <p
            className={`${ptSans.className} text-gray-500 font-medium text-sm md:text-base`}
          >
            Schedule, manage, and track your tutoring sessions.
          </p>
        </div>
      </motion.div>

      {/* Controls Toolbar */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-200/60"
      >
        {/* History Button */}
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: "#f3f4f6" }}
          whileTap={{ scale: 0.95 }}
          onClick={onHistoryClick}
          className={`${montserrat.className} cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-600 hover:text-[#8B0E0E] font-bold transition-colors text-sm`}
        >
          <History size={18} />
          <span>History</span>
        </motion.button>

        {/* Vertical Divider */}
        <div className="w-[1px] h-8 bg-gray-200" />

        {/* View Toggle Switch */}
        <div className="relative flex items-center bg-gray-100 rounded-xl p-1 h-[44px] w-[110px]">
          {/* Active Indicator */}
          <motion.div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm border border-black/5 z-0"
            initial={false}
            animate={{
              x: viewMode === "month" ? 0 : "100%",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />

          {/* Month Button */}
          <button
            onClick={() => onViewModeChange("month")}
            className={`relative z-10 w-1/2 h-full flex items-center justify-center cursor-pointer transition-colors rounded-lg ${
              viewMode === "month"
                ? "text-[#8B0E0E]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <CalendarIcon size={18} />
          </button>

          {/* Year Button */}
          <button
            onClick={() => onViewModeChange("year")}
            className={`relative z-10 w-1/2 h-full flex items-center justify-center cursor-pointer transition-colors rounded-lg ${
              viewMode === "year"
                ? "text-[#8B0E0E]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

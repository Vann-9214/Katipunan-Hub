"use client";

import React from "react";
import { Montserrat, PT_Sans } from "next/font/google";
import { Calendar as CalendarIcon, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface CalendarHeaderProps {
  viewMode: "month" | "year";
  onViewModeChange: (mode: string) => void;
}

export default function CalendarHeader({
  viewMode,
  onViewModeChange,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
      {/* Title Area */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center gap-4"
      >
        <div className="p-3 bg-gradient-to-br from-[#8B0E0E] to-[#5e0a0a] rounded-2xl shadow-lg shadow-red-900/20 text-white">
          <CalendarIcon size={32} />
        </div>
        <div>
          <h1
            className={`${montserrat.className} text-[28px] md:text-[32px] font-extrabold text-[#1a1a1a] leading-tight`}
          >
            Event Board
          </h1>
          <p
            className={`${ptSans.className} text-gray-500 font-medium text-sm md:text-base`}
          >
            Manage your academic schedule and reminders.
          </p>
        </div>
      </motion.div>

      {/* Controls Toolbar */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-gray-200/60"
      >
        {/* View Switcher Container */}
        <div className="relative flex items-center bg-gray-100/50 rounded-xl p-1 h-[44px]">
          {/* Sliding Background */}
          <motion.div
            className="absolute top-1 bottom-1 w-[50px] bg-white rounded-lg shadow-sm border border-black/5 z-0"
            initial={false}
            animate={{
              x: viewMode === "month" ? 0 : 50,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />

          {/* Month Button */}
          <button
            onClick={() => onViewModeChange("Month")}
            className={`relative z-10 w-[50px] h-full flex items-center justify-center cursor-pointer transition-colors rounded-lg ${
              viewMode === "month"
                ? "text-[#8B0E0E]"
                : "text-gray-400 hover:text-gray-600"
            }`}
            title="Month View"
          >
            <CalendarIcon size={18} />
          </button>

          {/* Year Button */}
          <button
            onClick={() => onViewModeChange("Year")}
            className={`relative z-10 w-[50px] h-full flex items-center justify-center cursor-pointer transition-colors rounded-lg ${
              viewMode === "year"
                ? "text-[#8B0E0E]"
                : "text-gray-400 hover:text-gray-600"
            }`}
            title="Year View"
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

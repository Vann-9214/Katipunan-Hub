"use client";

import { useState } from "react";
import {
  Calendar as CalendarIcon,
  LayoutGrid,
  History,
  GraduationCap,
} from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import PLCViewMonth from "./viewMonth";
import PLCViewYear from "./viewYear";
import HistoryModal from "./historyModal";
import { usePLCBookings } from "../../../../../supabase/Lib/PLC/usePLCBooking";
import LoadingScreen from "../../ReusableComponent/LoadingScreen";
// 1. Import motion
import { motion } from "framer-motion";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

export default function PLCContent() {
  const today = new Date();

  const [viewMode, setViewMode] = useState<"year" | "month">("month");
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // --- Hook to fetch Data and Loading State ---
  const {
    historyBookings,
    isTutor,
    refreshBookings,
    deleteHistoryBooking,
    rateTutor,
    isInitialLoading,
  } = usePLCBookings(currentYear, currentMonth, null);

  const handleMonthClick = (monthIndex: number) => {
    setCurrentMonth(monthIndex);
    setViewMode("month");
  };

  const handleHistoryClick = () => {
    refreshBookings(true);
    setIsHistoryOpen(true);
  };

  // Function to show a custom confirmation dialog
  const showCustomConfirmation = async (message: string): Promise<boolean> => {
    console.warn(
      "Using placeholder confirm dialog. Replace with a custom modal UI."
    );
    return window.confirm(message);
  };

  const handleDeleteHistory = async (id: string) => {
    const confirmed = await showCustomConfirmation(
      "Are you sure you want to delete this history record?"
    );
    if (confirmed) {
      await deleteHistoryBooking(id);
    }
  };

  // --- Initial Loading Conditional Render ---
  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  // --- Main Content ---
  return (
    <div className="min-h-screen bg-white w-full pb-12">
      {/* --- Page Container --- */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* --- Header & Toolbar Section --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          {/* Title Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
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
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-200/60"
          >
            {/* History Button */}
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleHistoryClick}
              className={`${montserrat.className} flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-600 hover:text-[#8B0E0E] font-bold transition-colors text-sm`}
            >
              <History size={18} />
              <span>History</span>
            </motion.button>

            {/* Vertical Divider */}
            <div className="w-[1px] h-8 bg-gray-200" />

            {/* View Toggle Switch */}
            <div className="relative flex items-center bg-gray-100 rounded-xl p-1 h-[44px] w-[110px]">
              {/* Active Indicator (Sliding Background) */}
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
                onClick={() => setViewMode("month")}
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
                onClick={() => setViewMode("year")}
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

        {/* --- View Switcher Content --- */}
        <motion.div
          layout
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {viewMode === "year" ? (
            <PLCViewYear
              year={currentYear}
              onMonthClick={handleMonthClick}
              onPrevYear={() => setCurrentYear((y) => y - 1)}
              onNextYear={() => setCurrentYear((y) => y + 1)}
              onYearSelect={(y) => setCurrentYear(y)}
            />
          ) : (
            <PLCViewMonth
              year={currentYear}
              monthIndex={currentMonth}
              onPrevMonth={() => {
                if (currentMonth === 0) {
                  setCurrentMonth(11);
                  setCurrentYear(currentYear - 1);
                } else {
                  setCurrentMonth(currentMonth - 1);
                }
              }}
              onNextMonth={() => {
                if (currentMonth === 11) {
                  setCurrentMonth(0);
                  setCurrentYear(currentYear + 1);
                } else {
                  setCurrentMonth(currentMonth + 1);
                }
              }}
            />
          )}
        </motion.div>

        {/* History Modal */}
        <HistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          bookings={historyBookings}
          isTutor={isTutor}
          onRateTutor={rateTutor}
          onDelete={handleDeleteHistory}
        />
      </div>
    </div>
  );
}

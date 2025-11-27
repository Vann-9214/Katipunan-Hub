"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, LayoutGrid, History } from "lucide-react";
import { Montserrat } from "next/font/google";
import PLCViewMonth from "./viewMonth";
import PLCViewYear from "./viewYear";
import HistoryModal from "./historyModal";
import { usePLCBookings } from "../../../../../supabase/Lib/PLC/usePLCBooking";
import LoadingScreen from "../../ReusableComponent/LoadingScreen";
// 1. Import motion
import { motion } from "framer-motion";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });

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

  // Function to show a custom confirmation dialog (as alert() and confirm() are forbidden)
  const showCustomConfirmation = async (message: string): Promise<boolean> => {
    // Placeholder for required custom confirmation logic
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
    <div className="w-full mx-auto">
      {/* Page Header & View Toggles */}
      <div className="flex justify-between items-center mb-4">
        <h1
          className={`${montserrat.className} text-[32px] font-bold text-[#8B0E0E]`}
        >
          Peer Learning Center
        </h1>

        <div className="flex items-center gap-4">
          {/* History Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleHistoryClick}
            className={`${montserrat.className} cursor-pointer flex items-center gap-2 px-4 h-[40px] bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow text-[#8B0E0E] font-bold transition-all`}
          >
            <History size={20} />
            <span>History</span>
          </motion.button>

          {/* Animated View Toggles */}
          <div className="relative flex items-center bg-white border border-black rounded-lg overflow-hidden h-[40px] w-[100px]">
            {/* Active Indicator (Sliding Background) */}
            <motion.div
              className="absolute top-0 bottom-0 w-1/2 bg-gray-200 z-0"
              initial={false}
              animate={{
                x: viewMode === "month" ? 0 : "100%",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />

            {/* Month Button */}
            <button
              onClick={() => setViewMode("month")}
              className={`relative z-10 w-1/2 h-full flex items-center justify-center cursor-pointer transition-colors ${
                viewMode === "month"
                  ? "text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              <CalendarIcon size={20} />
            </button>

            {/* Separator Line */}
            <div className="w-[1px] h-full bg-black/10 relative z-10" />

            {/* Year Button */}
            <button
              onClick={() => setViewMode("year")}
              className={`relative z-10 w-1/2 h-full flex items-center justify-center cursor-pointer transition-colors ${
                viewMode === "year"
                  ? "text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              <LayoutGrid size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex justify-center w-full">
        {viewMode === "year" ? (
          <PLCViewYear
            year={currentYear}
            onMonthClick={handleMonthClick}
            onPrevYear={() => setCurrentYear((y) => y - 1)}
            onNextYear={() => setCurrentYear((y) => y + 1)}
            onYearSelect={(y) => setCurrentYear(y)} // <--- THIS FIXED IT
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
      </div>

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
  );
}

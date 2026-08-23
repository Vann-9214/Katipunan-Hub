"use client";

import { useState } from "react";
import PLCHeader from "./components/PLCHeader";
import PLCViewMonth from "./components/PLCViewMonth";
import PLCViewYear from "./components/PLCViewYear";
import HistoryModal from "./components/HistoryModal";
import { usePLCBookings } from "./hooks/usePLCBookings";
import LoadingScreen from "@/components/LoadingScreen";
import BackgroundGradient from "@/components/BackgroundGradient";
import { motion } from "framer-motion";

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

  const handleDeleteHistory = async (id: string) => {
    const confirmed = window.confirm(
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
    <div className="min-h-screen w-full pb-12 relative">
      <BackgroundGradient />

      {/* --- Page Container --- */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* --- Header Section --- */}
        <PLCHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onHistoryClick={handleHistoryClick}
        />

        {/* --- View Content --- */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
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

        {/* --- History Modal --- */}
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

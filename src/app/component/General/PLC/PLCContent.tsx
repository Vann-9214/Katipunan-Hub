"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, LayoutGrid, History } from "lucide-react";
import { Montserrat } from "next/font/google";
import PLCViewMonth from "./viewMonth";
import PLCViewYear from "./viewYear";
import HistoryModal from "./historyModal";
import { usePLCBookings } from "../../../../../supabase/Lib/PLC/usePLCBooking";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });

export default function PLCContent() {
  const today = new Date();

  const [viewMode, setViewMode] = useState<"year" | "month">("month");
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // --- Hook to fetch History Data & Delete Action ---
  const { historyBookings, isTutor, refreshBookings, deleteHistoryBooking } =
    usePLCBookings(currentYear, currentMonth, null);

  const handleMonthClick = (monthIndex: number) => {
    setCurrentMonth(monthIndex);
    setViewMode("month");
  };

  const handleHistoryClick = () => {
    refreshBookings();
    setIsHistoryOpen(true);
  };

  const handleDeleteHistory = async (id: string) => {
    if (confirm("Are you sure you want to delete this history record?")) {
      await deleteHistoryBooking(id);
    }
  };

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
          <button
            onClick={handleHistoryClick}
            className={`${montserrat.className} flex items-center gap-2 px-4 h-[40px] bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow text-[#8B0E0E] font-bold transition-all`}
          >
            <History size={20} />
            <span>History</span>
          </button>

          {/* View Toggles */}
          <div className="flex items-center gap-0 bg-white border border-black rounded-lg overflow-hidden h-[40px]">
            <button
              onClick={() => setViewMode("month")}
              className={`cursor-pointer px-3 h-full flex items-center justify-center transition-colors ${
                viewMode === "month" ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
            >
              <CalendarIcon size={20} className="text-black" />
            </button>
            <div className="w-[1px] h-full bg-black" />
            <button
              onClick={() => setViewMode("year")}
              className={`cursor-pointer px-3 h-full flex items-center justify-center transition-colors ${
                viewMode === "year" ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
            >
              <LayoutGrid size={20} className="text-black" />
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
        onDelete={handleDeleteHistory}
      />
    </div>
  );
}

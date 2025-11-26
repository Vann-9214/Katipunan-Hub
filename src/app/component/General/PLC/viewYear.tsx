"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import { MONTHS, getDaysInMonth, getFirstDayOfMonth } from "./Utils";
import {
  usePLCYearBookings,
  MonthBooking,
} from "../../../../../supabase/Lib/PLC/usePLCBooking";
import { motion, AnimatePresence } from "framer-motion";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

interface PLCViewYearProps {
  year: number;
  onMonthClick: (monthIndex: number) => void;
  onPrevYear: () => void;
  onNextYear: () => void;
  onYearSelect?: (year: number) => void; // Optional to prevent crash
}

// --- Helper: Map Status to Hex Color ---
const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "#FFB74D"; // Orange
    case "Approved":
      return "#81C784"; // Green
    case "Completed":
      return "#81C784"; // Green
    case "Rejected":
      return "#EF9A9A"; // Red
    case "Starting...":
      return "#EFBF04"; // Gold
    default:
      return "#FFFFFF";
  }
};

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function PLCViewYear({
  year,
  onMonthClick,
  onPrevYear,
  onNextYear,
  onYearSelect,
}: PLCViewYearProps) {
  const { yearBookings, getDateString } = usePLCYearBookings(year);
  const [now, setNow] = useState<Date>(new Date());
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const yearPickerRef = useRef<HTMLDivElement>(null);

  // Generate a range of years for the picker (e.g., current year - 5 to + 6)
  const yearRange = Array.from({ length: 12 }, (_, i) => year - 5 + i);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        yearPickerRef.current &&
        !yearPickerRef.current.contains(event.target as Node)
      ) {
        setIsYearPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusForBooking = (booking: MonthBooking) => {
    if (booking.status !== "Approved") return booking.status;

    const [bYear, bMonth, bDay] = booking.bookingDate.split("-").map(Number);
    const bookingDate = new Date(bYear, bMonth - 1, bDay);

    // Simple check for past/future based on date only for year view visualization
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (bookingDate < today) return "Completed";
    if (bookingDate > today) return "Approved";

    if (!booking.startTime) return "Approved";

    const [startH, startM] = booking.startTime.split(":").map(Number);
    const start = new Date(now);
    start.setHours(startH, startM, 0, 0);

    const end = new Date(now);
    if (booking.endTime) {
      const [endH, endM] = booking.endTime.split(":").map(Number);
      end.setHours(endH, endM, 0, 0);
    } else {
      end.setTime(start.getTime() + 60 * 60 * 1000);
    }

    const current = new Date(now);
    if (current >= start && current < end) return "Starting...";
    if (current >= end) return "Completed";

    return "Approved";
  };

  const handleYearSelect = (selectedYear: number) => {
    if (onYearSelect) {
      onYearSelect(selectedYear);
    }
    setIsYearPickerOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      // Outer Gold Gradient Container
      className="w-full p-[3px] rounded-[30px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-2xl"
    >
      <div className="bg-white rounded-[27px] p-8 w-full h-full min-h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 px-4 relative z-2">
          <button
            onClick={onPrevYear}
            className="group p-3 hover:bg-[#8B0E0E]/10 rounded-full transition-all active:scale-95"
          >
            <ChevronLeft
              size={28}
              className="text-[#8B0E0E] group-hover:-translate-x-1 transition-transform"
            />
          </button>

          {/* YEAR SELECTOR */}
          <div
            className="relative flex flex-col items-center"
            ref={yearPickerRef}
          >
            <button
              onClick={() => setIsYearPickerOpen(!isYearPickerOpen)}
              className="flex items-center gap-2 group cursor-pointer hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={year}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className={`${montserrat.className} text-[42px] font-extrabold text-[#8B0E0E] tracking-tight leading-none`}
                >
                  {year}
                </motion.span>
              </AnimatePresence>
              <ChevronDown
                size={24}
                className={`text-[#8B0E0E] transition-transform duration-300 ${
                  isYearPickerOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <span
              className={`${montserrat.className} text-gray-400 text-sm font-semibold uppercase tracking-widest mt-1`}
            >
              Yearly Overview
            </span>

            {/* YEAR DROPDOWN */}
            <AnimatePresence>
              {isYearPickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  // FIXED: Removed duplicate opacity property below
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 w-[200px] bg-white rounded-[20px] shadow-2xl border border-gray-100 overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar z-10"
                >
                  <div className="p-2 grid grid-cols-1 gap-1">
                    {yearRange.map((yr) => (
                      <button
                        key={yr}
                        onClick={() => handleYearSelect(yr)}
                        className={`px-4 py-3 rounded-[12px] text-[16px] font-bold transition-colors ${
                          yr === year
                            ? "bg-[#8B0E0E] text-white"
                            : "text-gray-700 hover:bg-[#EFBF04]/20 hover:text-[#8B0E0E]"
                        } ${montserrat.className}`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onNextYear}
            className="group p-3 hover:bg-[#8B0E0E]/10 rounded-full transition-all active:scale-95"
          >
            <ChevronRight
              size={28}
              className="text-[#8B0E0E] group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>

        {/* Grid of Months */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-1"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {MONTHS.map((monthName, monthIndex) => {
            const daysInMonth = getDaysInMonth(year, monthIndex);
            const startOffset = getFirstDayOfMonth(year, monthIndex);
            // Ensure 6 rows for consistent height (42 slots)
            const totalSlots = 42;
            const dayList = Array.from(
              { length: daysInMonth },
              (_, i) => i + 1
            );
            const gridCells = [
              ...Array(startOffset).fill(null),
              ...dayList,
              ...Array(totalSlots - (startOffset + daysInMonth)).fill(null),
            ].slice(0, 42);

            return (
              <motion.div
                key={monthName}
                variants={itemVariants}
                whileHover={{
                  y: -5,
                  boxShadow: "0 20px 40px -10px rgba(139, 14, 14, 0.1)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onMonthClick(monthIndex)}
                className="bg-white border border-gray-100 rounded-[24px] p-5 cursor-pointer transition-all shadow-sm hover:border-[#8B0E0E]/20 group relative overflow-hidden"
              >
                {/* Hover Decoration Background */}
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#EFBF04]/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <h3
                  className={`${montserrat.className} text-left font-bold text-[#8B0E0E] text-[18px] mb-4 pl-1`}
                >
                  {monthName}
                </h3>

                {/* Weekday Header */}
                <div className="grid grid-cols-7 mb-2 pointer-events-none">
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <div
                      key={i}
                      className={`${montserrat.className} text-center text-[10px] font-bold text-gray-400`}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Month Grid */}
                <div className="grid grid-cols-7 gap-1 pointer-events-none">
                  {gridCells.map((day, i) => {
                    let cellStyle: React.CSSProperties = {};
                    let className = `aspect-square flex items-center justify-center text-[10px] rounded-full ${ptSans.className} transition-colors`;

                    if (day !== null) {
                      className += " text-gray-700";
                      const dateStr = getDateString(year, monthIndex, day);
                      const bookingsOnDay = yearBookings.filter(
                        (b) => b.bookingDate === dateStr
                      );

                      const uniqueColors = Array.from(
                        new Set(
                          bookingsOnDay.map((b) =>
                            getStatusColor(getStatusForBooking(b))
                          )
                        )
                      );

                      if (uniqueColors.length === 0) {
                        className += " opacity-80";
                      } else if (uniqueColors.length === 1) {
                        cellStyle = {
                          backgroundColor: uniqueColors[0],
                          color: "#FFFFFF",
                          fontWeight: "bold",
                        };
                        className += " shadow-sm";
                      } else {
                        const step = 100 / uniqueColors.length;
                        const gradientStops = uniqueColors
                          .map(
                            (color, idx) =>
                              `${color} ${idx * step}% ${(idx + 1) * step}%`
                          )
                          .join(", ");
                        cellStyle = {
                          background: `linear-gradient(135deg, ${gradientStops})`,
                          color: "#FFFFFF",
                          fontWeight: "bold",
                        };
                        className += " shadow-sm";
                      }
                    } else {
                      className += " opacity-0"; // Hidden empty cells
                    }

                    return (
                      <div key={i} className={className} style={cellStyle}>
                        {day}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}

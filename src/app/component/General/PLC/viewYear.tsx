"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import { MONTHS, getDaysInMonth, getFirstDayOfMonth } from "./Utils";
import {
  usePLCYearBookings,
  MonthBooking,
} from "../../../../../supabase/Lib/PLC/usePLCBooking";
// 1. Import Variants
import { motion, AnimatePresence, Variants } from "framer-motion";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

interface PLCViewYearProps {
  year: number;
  onMonthClick: (monthIndex: number) => void;
  onPrevYear: () => void;
  onNextYear: () => void;
  onYearSelect?: (year: number) => void;
}

// --- Helper: Map Status to Hex Color ---
const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "#FFB74D"; // Orange
    case "Approved":
      return "#81C784"; // Green
    case "Completed":
      return "#4A7c59"; // Darker Green for completed
    case "Rejected":
      return "#EF9A9A"; // Red
    case "Starting...":
      return "#EFBF04"; // Gold
    default:
      return "#E5E7EB"; // Gray for empty/default
  }
};

// --- Animation Variants (Professional Smooth) ---
// 2. Explicitly type as Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04, // Faster stagger for less waiting
      delayChildren: 0.05,
    },
  },
};

// 3. Explicitly type as Variants to fix "type: string" error
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 }, // Slide up instead of scale (less laggy)
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "tween",
      ease: "easeOut",
      duration: 0.4,
    },
  },
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

  // Generate a range of years for the picker
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
    <div className="relative w-full">
      {/* --- 1. Static Shadow Element --- */}
      <div className="absolute inset-0 bg-black/10 rounded-[24px] blur-md -z-10 translate-y-4" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        // --- 2. Gold Gradient Border Container ---
        className="w-full p-[2px] rounded-[24px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-xl"
      >
        {/* --- 3. Inner White Content --- */}
        <div className="bg-gray-50/50 rounded-[22px] overflow-hidden w-full h-full min-h-[600px] flex flex-col">
          {/* --- HEADER: Deep Red Gradient Banner --- */}
          <div className="bg-gradient-to-b from-[#4e0505] to-[#3a0000] p-6 shadow-md border-b border-[#EFBF04]/30 relative z-10">
            <div className="flex items-center justify-between">
              {/* Previous Year Button */}
              <button
                onClick={onPrevYear}
                className="cursor-pointer group p-2 hover:bg-white/10 rounded-full transition-all active:scale-95 border border-white/5"
              >
                <ChevronLeft
                  size={24}
                  className="text-white/80 group-hover:text-white group-hover:-translate-x-1 transition-all"
                />
              </button>

              {/* YEAR SELECTOR */}
              <div
                className="relative flex flex-col items-center"
                ref={yearPickerRef}
              >
                <button
                  onClick={() => setIsYearPickerOpen(!isYearPickerOpen)}
                  className="flex items-center gap-3 group cursor-pointer hover:bg-black/20 px-5 py-2 rounded-full transition-all border border-transparent hover:border-[#EFBF04]/30"
                >
                  <CalendarIcon size={20} className="text-[#EFBF04]" />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={year}
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -5, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`${montserrat.className} text-[32px] font-bold text-white tracking-tight leading-none`}
                    >
                      {year}
                    </motion.span>
                  </AnimatePresence>
                  <ChevronDown
                    size={20}
                    className={`text-[#EFBF04] transition-transform duration-300 ${
                      isYearPickerOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* YEAR DROPDOWN */}
                <AnimatePresence>
                  {isYearPickerOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full mt-4 w-[240px] bg-white rounded-[20px] shadow-2xl border border-gray-100 overflow-hidden max-h-[320px] overflow-y-auto custom-scrollbar z-50"
                    >
                      <div className="p-2 grid grid-cols-2 gap-2">
                        {yearRange.map((yr) => (
                          <button
                            key={yr}
                            onClick={() => handleYearSelect(yr)}
                            className={`cursor-pointer px-2 py-3 rounded-[12px] text-[14px] font-bold transition-colors ${
                              yr === year
                                ? "bg-gradient-to-r from-[#4e0505] to-[#3a0000] text-white shadow-md"
                                : "text-gray-600 hover:bg-gray-100"
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

              {/* Next Year Button */}
              <button
                onClick={onNextYear}
                className="group p-2 hover:bg-white/10 rounded-full transition-all active:scale-95 border border-white/5"
              >
                <ChevronRight
                  size={24}
                  className="text-white/80 cursor-pointer group-hover:text-white group-hover:translate-x-1 transition-all"
                />
              </button>
            </div>
          </div>

          {/* --- Grid of Months --- */}
          <div className="flex-1 p-6 md:p-8 bg-white">
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 relative z-1"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {MONTHS.map((monthName, monthIndex) => {
                const daysInMonth = getDaysInMonth(year, monthIndex);
                const startOffset = getFirstDayOfMonth(year, monthIndex);
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
                      y: -4,
                      boxShadow: "0 10px 30px -10px rgba(78, 5, 5, 0.10)",
                      transition: { duration: 0.2 },
                    }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onMonthClick(monthIndex)}
                    className="bg-white border border-gray-100 rounded-[20px] p-5 cursor-pointer transition-all shadow-sm hover:border-[#EFBF04]/40 group relative overflow-hidden"
                  >
                    {/* Header: Month Name */}
                    <div className="flex justify-between items-center mb-4 pl-1 border-b border-gray-100 pb-2">
                      <h3
                        className={`${montserrat.className} font-bold text-[#4e0505] text-[16px]`}
                      >
                        {monthName}
                      </h3>
                    </div>

                    {/* Weekday Header */}
                    <div className="grid grid-cols-7 mb-2">
                      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                        <div
                          key={i}
                          className={`${montserrat.className} text-center text-[9px] font-bold text-gray-400 uppercase tracking-wider`}
                        >
                          {d}
                        </div>
                      ))}
                    </div>

                    {/* Month Grid */}
                    <div className="grid grid-cols-7 gap-y-1 gap-x-1 pointer-events-none">
                      {gridCells.map((day, i) => {
                        let cellStyle: React.CSSProperties = {};
                        let className = `aspect-square flex items-center justify-center text-[10px] rounded-full ${ptSans.className} transition-all`;

                        if (day !== null) {
                          className += " text-gray-600";
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
                            // Empty day styling
                            className += " hover:bg-gray-50";
                          } else if (uniqueColors.length === 1) {
                            cellStyle = {
                              backgroundColor: uniqueColors[0],
                              color: "#FFFFFF",
                              fontWeight: "bold",
                            };
                            className += " shadow-sm scale-110"; // Slight pop for booked days
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
                            className += " shadow-sm scale-110";
                          }
                        } else {
                          className += " opacity-0"; // Completely hide empty padding cells
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

          {/* --- Legend Footer (Optional visuals) --- */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap justify-center gap-6">
            {[
              { label: "Approved", color: "#81C784" },
              { label: "Pending", color: "#FFB74D" },
              { label: "Starting", color: "#EFBF04" },
              { label: "Rejected", color: "#EF9A9A" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span
                  className={`${ptSans.className} text-xs text-gray-500 font-medium`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

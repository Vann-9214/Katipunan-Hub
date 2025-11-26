"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MoveRight,
  Loader2,
  Plus,
} from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import { WEEKDAYS, MONTHS, getDaysInMonth, getFirstDayOfMonth } from "./Utils";
import BookingModal from "./bookingModal";
import FullDetails from "./fullDetails";
import {
  usePLCBookings,
  Booking,
  MonthBooking,
} from "../../../../../supabase/Lib/PLC/usePLCBooking";
// 1. Import Framer Motion
import { motion, AnimatePresence } from "framer-motion";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

interface PLCViewMonthProps {
  year: number;
  monthIndex: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const formatTimeStr = (timeStr: string) => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatTimeDisplay = (startStr: string, endStr?: string) => {
  const start = formatTimeStr(startStr);
  const end = endStr ? formatTimeStr(endStr) : "";
  return end ? `${start} - ${end}` : start;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "#FFB74D";
    case "Approved":
    case "Completed":
      return "#81C784";
    case "Rejected":
    case "Cancelled":
      return "#EF9A9A";
    case "Starting...":
      return "#FFD239";
    default:
      return "#FFFFFF";
  }
};

// Helper for the small dots in the calendar grid
const getStatusDotColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "#F59E0B"; // Amber
    case "Approved":
      return "#10B981"; // Emerald
    case "Completed":
      return "#10B981";
    case "Rejected":
      return "#EF4444"; // Red
    case "Starting...":
      return "#EFBF04"; // Gold
    default:
      return "#E5E7EB";
  }
};

export default function PLCViewMonth({
  year,
  monthIndex,
  onPrevMonth,
  onNextMonth,
}: PLCViewMonthProps) {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const [now, setNow] = useState<Date>(new Date());

  const [bookingStats, setBookingStats] = useState({
    rejectionCount: 0,
    totalTutors: 0,
  });

  const {
    currentUser,
    isTutor,
    monthBookings,
    dayBookings,
    isLoadingDayBookings,
    cancelBooking,
    approveBooking,
    denyBooking,
    getBookingStats,
    refreshBookings,
    getDateString,
    rateTutor,
  } = usePLCBookings(year, monthIndex, selectedDate);

  // --- REALTIME CLOCK ---
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const d = new Date();
    if (d.getFullYear() === year && d.getMonth() === monthIndex) {
      setSelectedDate(d.getDate());
    } else {
      setSelectedDate(1);
    }
  }, [year, monthIndex]);

  const refreshStats = async (id: string) => {
    try {
      const stats = await getBookingStats(id);
      setBookingStats(stats);
    } catch (error) {
      console.error("Failed to load stats", error);
    }
  };

  const handleBookingClick = async (booking: Booking) => {
    setSelectedBooking(booking);
    await refreshStats(booking.id);
    setIsRequestModalOpen(true);
  };

  const handleCancelRequest = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel?")) return;
    await cancelBooking(bookingId);
    setIsRequestModalOpen(false);
  };
  const handleApprove = async (bookingId: string) => {
    if (!confirm("Confirm this booking?")) return;
    await approveBooking(bookingId);
    setIsRequestModalOpen(false);
  };
  const handleDeny = async (bookingId: string) => {
    if (!confirm("Deny this booking?")) return;
    await denyBooking(bookingId);
    setSelectedBooking((prev) =>
      prev ? { ...prev, hasRejected: true } : null
    );
  };

  const getStatusForBooking = (booking: MonthBooking | Booking) => {
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

  /* Grid Setup */
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const startOffset = getFirstDayOfMonth(year, monthIndex);
  const blanks: null[] = Array(startOffset).fill(null);
  const days: number[] = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalSlots: (number | null)[] = [...blanks, ...days];
  while (totalSlots.length % 7 !== 0) totalSlots.push(null);

  const currentMonthName = MONTHS[monthIndex];
  const dayName = (
    selectedDate
      ? new Date(year, monthIndex, selectedDate)
      : new Date(year, monthIndex, 1)
  ).toLocaleString("en-US", { weekday: "long" });

  return (
    <>
      {/* 2. Animated Container - GOLD GRADIENT BORDER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full h-[650px] p-[3px] rounded-[25px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-xl"
      >
        <div className="w-full h-full bg-white rounded-[22px] flex overflow-hidden">
          {/* --- LEFT SIDE: CALENDAR (Clean White with Maroon Accents) --- */}
          <div className="w-[60%] flex flex-col border-r border-gray-200">
            {/* Left Header */}
            <div className="flex justify-between items-center px-8 py-6 bg-white border-b border-gray-100">
              <h2
                className={`${montserrat.className} text-[28px] font-extrabold text-[#8B0E0E]`}
              >
                {currentMonthName} {year}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={onPrevMonth}
                  className="hover:bg-[#8B0E0E]/10 p-2 rounded-full text-[#8B0E0E] transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={onNextMonth}
                  className="hover:bg-[#8B0E0E]/10 p-2 rounded-full text-[#8B0E0E] transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 px-8 pt-4 pb-2">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className={`${montserrat.className} text-center font-bold text-[14px] text-gray-400 uppercase tracking-wider`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid - LINES + ROUNDED SELECTION */}
            <div className="grid grid-cols-7 auto-rows-fr flex-1 px-8 pb-8 gap-0 border-l border-t border-gray-200 rounded-tl-[12px] ml-8 mb-8 overflow-hidden">
              {totalSlots.map((day, index) => {
                const isSelected = day === selectedDate;
                let isPastDate = false;
                // Base class keeps the grid lines (Square cells)
                let baseClasses = `relative w-full h-full flex items-center justify-center text-[16px] transition-all duration-150 ${ptSans.className} border-b border-r border-gray-200 `;

                if (day !== null) {
                  const checkDate = new Date(year, monthIndex, day);
                  const checkToday = new Date();
                  checkToday.setHours(0, 0, 0, 0);
                  if (checkDate < checkToday) isPastDate = true;

                  if (isPastDate)
                    baseClasses += " bg-gray-50 text-gray-300 cursor-default";
                  else {
                    baseClasses +=
                      " cursor-pointer text-black hover:bg-gray-50";
                  }
                } else {
                  baseClasses += " bg-gray-50/50";
                }

                return (
                  <div key={index} className="relative h-full min-h-[80px]">
                    {day !== null ? (
                      <button
                        onClick={() => !isPastDate && setSelectedDate(day)}
                        disabled={isPastDate}
                        className={baseClasses}
                      >
                        {/* --- ROUNDED SELECTION INDICATOR (Centered) --- */}
                        <div className="relative flex items-center justify-center w-10 h-10">
                          {isSelected && !isPastDate && (
                            <motion.div
                              layoutId="selection-bubble"
                              className="absolute inset-0 bg-[#8B0E0E] rounded-full shadow-md"
                              initial={false}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                              }}
                            />
                          )}
                          <span
                            className={`relative z-10 font-bold ${
                              isSelected && !isPastDate ? "text-white" : ""
                            }`}
                          >
                            {day}
                          </span>
                        </div>

                        {/* Event Dots (Below the number) */}
                        {!isPastDate &&
                          !isSelected &&
                          (() => {
                            const bookingsOnDay = monthBookings.filter(
                              (b) =>
                                b.bookingDate ===
                                getDateString(year, monthIndex, day)
                            );
                            if (bookingsOnDay.length > 0) {
                              const uniqueColors = Array.from(
                                new Set(
                                  bookingsOnDay.map((b) =>
                                    getStatusDotColor(getStatusForBooking(b))
                                  )
                                )
                              );
                              return (
                                <div className="absolute bottom-2 flex gap-1 justify-center w-full">
                                  {uniqueColors.slice(0, 3).map((color, i) => (
                                    <div
                                      key={i}
                                      className="w-1.5 h-1.5 rounded-full"
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                              );
                            }
                          })()}
                      </button>
                    ) : (
                      <div className="w-full h-full border-b border-r border-gray-200 bg-gray-50/30" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- RIGHT SIDE: DETAILS (Maroon Gradient Background) --- */}
          <div className="w-[40%] flex flex-col h-full bg-gradient-to-b from-[#4e0505] to-[#3a0000] text-white relative">
            {/* Decoration */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#EFBF04]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Right Header */}
            <div className="flex flex-col px-8 pt-8 pb-4 shrink-0 z-10">
              <div className="flex justify-between items-start">
                <div className="overflow-hidden">
                  {/* ANIMATED DATE HEADER */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedDate} // Triggers animation on date switch
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h2
                        className={`${montserrat.className} text-[36px] font-bold leading-none text-white`}
                      >
                        {selectedDate || 1}
                      </h2>
                      <p
                        className={`${montserrat.className} text-[18px] font-medium text-white/80 mt-1`}
                      >
                        {dayName}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {!isTutor && (
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="group flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all cursor-pointer border border-white/20"
                  >
                    <Plus size={18} className="text-[#EFBF04]" />
                    <span
                      className={`${montserrat.className} text-sm font-bold text-[#EFBF04] group-hover:text-[#FFD700]`}
                    >
                      Book
                    </span>
                  </button>
                )}
              </div>
              <div className="h-px w-full bg-white/20 mt-6" />
            </div>

            {/* Booking List */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-4 custom-scrollbar z-10">
              {isLoadingDayBookings ? (
                <div className="flex justify-center pt-10">
                  <Loader2 className="animate-spin text-[#EFBF04]" size={32} />
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {dayBookings.length > 0 ? (
                    dayBookings.map((booking, idx) => {
                      const activeStatus = getStatusForBooking(booking);
                      let displayStatus = activeStatus;

                      // --- DYNAMIC BACKGROUND LOGIC ---
                      // Matching your original code's color logic
                      let statusColor = "text-gray-600";
                      let cardBg = "bg-[#F4E4E4]"; // Default Gray/White mix

                      if (activeStatus === "Starting...") {
                        statusColor = "text-[#EFBF04] animate-pulse"; // Gold Text
                        cardBg = "bg-[#EFBF04]/20"; // Gold Tint BG
                      } else if (activeStatus === "Completed") {
                        statusColor = "text-green-600";
                        cardBg = "bg-green-100 border border-green-700";
                      } else if (activeStatus === "Approved") {
                        statusColor = "text-green-600";
                        cardBg = "bg-green-100";
                      } else if (activeStatus === "Pending") {
                        statusColor = "text-[#D97706]"; // Orange
                        cardBg = "bg-orange-100";
                      } else if (
                        activeStatus === "Rejected" ||
                        activeStatus === "Cancelled"
                      ) {
                        statusColor = "text-red-600";
                        cardBg = "bg-red-100";
                      }

                      if (
                        isTutor &&
                        booking.hasRejected &&
                        booking.status === "Pending"
                      ) {
                        displayStatus = "Rejected";
                        statusColor = "text-red-600";
                        cardBg = "bg-red-100";
                      }

                      return (
                        // 4. Animated Booking Cards
                        <motion.div
                          key={booking.id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{
                            delay: idx * 0.05, // Stagger effect
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleBookingClick(booking)}
                          // Applied the dynamic cardBg here
                          className={`relative w-full ${cardBg} rounded-[15px] p-4 flex flex-col gap-2 hover:shadow-lg cursor-pointer group transition-all ${
                            activeStatus === "Starting..."
                              ? "ring-2 ring-[#EFBF04] border-[#EFBF04]"
                              : ""
                          }`}
                        >
                          <span
                            className={`absolute top-3 right-4 text-[12px] font-bold ${statusColor} ${montserrat.className}`}
                          >
                            {displayStatus}
                          </span>

                          <div className="flex gap-1 text-black text-[14px]">
                            <span
                              className={`${montserrat.className} font-bold`}
                            >
                              Subject :
                            </span>
                            <span
                              className={`${montserrat.className} font-bold`}
                            >
                              {booking.subject}
                            </span>
                          </div>
                          <div className="flex gap-1 text-black text-[14px]">
                            <span
                              className={`${montserrat.className} font-bold`}
                            >
                              {isTutor
                                ? "Student :"
                                : activeStatus === "Approved" ||
                                  activeStatus === "Starting..." ||
                                  activeStatus === "Completed"
                                ? "Tutor :"
                                : "Time :"}
                            </span>
                            <span
                              className={`${montserrat.className} font-normal`}
                            >
                              {isTutor
                                ? booking.Accounts?.fullName
                                : activeStatus === "Approved" ||
                                  activeStatus === "Starting..." ||
                                  activeStatus === "Completed"
                                ? booking.Tutor?.fullName
                                : formatTimeDisplay(
                                    booking.startTime,
                                    booking.endTime
                                  )}
                            </span>
                          </div>
                          {(isTutor ||
                            activeStatus === "Approved" ||
                            activeStatus === "Starting..." ||
                            activeStatus === "Completed") && (
                            <div className="flex gap-1 text-black text-[14px]">
                              <span
                                className={`${montserrat.className} font-bold`}
                              >
                                Time :
                              </span>
                              <span
                                className={`${montserrat.className} font-normal`}
                              >
                                {formatTimeDisplay(
                                  booking.startTime,
                                  booking.endTime
                                )}
                              </span>
                            </div>
                          )}
                          <div className="absolute bottom-3 text-black right-3 group-hover:translate-x-1 transition-transform">
                            <MoveRight size={18} />
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-[200px] text-white/50"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3">
                        <Plus size={32} className="opacity-50" />
                      </div>
                      <p
                        className={`${montserrat.className} text-[14px] font-medium`}
                      >
                        No sessions scheduled
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        selectedDate={
          selectedDate ? new Date(year, monthIndex, selectedDate) : null
        }
        onSuccess={refreshBookings}
      />

      {selectedBooking && currentUser && (
        <FullDetails
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          booking={{
            ...selectedBooking,
            studentName:
              selectedBooking.Accounts?.fullName ||
              currentUser.fullName ||
              "Student",
            studentCourse:
              selectedBooking.Accounts?.course ||
              currentUser.course ||
              "Course",
            studentYear:
              selectedBooking.Accounts?.year || currentUser.year || "Year",
            studentIDNum:
              selectedBooking.Accounts?.studentID ||
              currentUser.studentID ||
              "ID",
            avatarURL:
              selectedBooking.Accounts?.avatarURL || currentUser.avatarURL,
            hasRejected: selectedBooking.hasRejected,
            tutorName: selectedBooking.Tutor?.fullName,
          }}
          isTutor={isTutor}
          onCancelRequest={handleCancelRequest}
          onApproveRequest={handleApprove}
          onRejectRequest={handleDeny}
          onRateTutor={rateTutor}
          rejectionCount={bookingStats.rejectionCount}
          totalTutors={bookingStats.totalTutors}
        />
      )}
    </>
  );
}

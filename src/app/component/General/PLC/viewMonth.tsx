"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MoveRight, Loader2 } from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import { WEEKDAYS, MONTHS, getDaysInMonth, getFirstDayOfMonth } from "./Utils";
import BookingModal from "./bookingModal";
import FullDetails from "./fullDetails";
import {
  usePLCBookings,
  Booking,
  MonthBooking,
} from "../../../../../supabase/Lib/PLC/usePLCBooking";

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
      <div className="w-full h-[580px] bg-white rounded-[20px] border border-gray-800 shadow-md flex overflow-hidden p-8">
        {/* Calendar Left */}
        <div className="flex-1 pr-8 flex flex-col border-r border-gray-300 overflow-y-auto custom-scrollbar">
          {/* ... (Header and Days Header unchanged) ... */}
          <div className="flex justify-between items-center mb-6 px-2">
            <h2
              className={`${montserrat.className} text-[24px] font-bold text-black`}
            >
              {currentMonthName} {year}
            </h2>
            <div className="flex gap-4 text-black">
              <button
                onClick={onPrevMonth}
                className="hover:bg-gray-100 p-1 rounded-full"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={onNextMonth}
                className="hover:bg-gray-100 p-1 rounded-full"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className={`${montserrat.className} text-center font-semibold text-[16px] text-black pb-4`}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0 h-fit border-t border-l border-black">
            {totalSlots.map((day, index) => {
              const isSelected = day === selectedDate;
              let isPastDate = false;
              let cellStyle: React.CSSProperties = {};
              let baseClasses = `relative w-full h-full flex items-center justify-center text-[18px] transition-all duration-150 ${ptSans.className} border-b border-r border-black `;

              if (day !== null) {
                const checkDate = new Date(year, monthIndex, day);
                const checkToday = new Date();
                checkToday.setHours(0, 0, 0, 0);
                if (checkDate < checkToday) isPastDate = true;

                if (isPastDate)
                  baseClasses +=
                    " bg-gray-200 text-gray-400 cursor-not-allowed";
                else {
                  baseClasses += " cursor-pointer text-black hover:opacity-90";
                  const bookingsOnDay = monthBookings.filter(
                    (b) =>
                      b.bookingDate === getDateString(year, monthIndex, day)
                  );

                  const uniqueColors = Array.from(
                    new Set(
                      bookingsOnDay.map((b) =>
                        getStatusColor(getStatusForBooking(b))
                      )
                    )
                  );

                  if (uniqueColors.length === 0)
                    baseClasses += " bg-white hover:bg-gray-50";
                  else if (uniqueColors.length === 1)
                    cellStyle = { backgroundColor: uniqueColors[0] };
                  else {
                    const step = 100 / uniqueColors.length;
                    const gradientStops = uniqueColors
                      .map(
                        (color, idx) =>
                          `${color} ${idx * step}% ${(idx + 1) * step}%`
                      )
                      .join(", ");
                    cellStyle = {
                      background: `linear-gradient(135deg, ${gradientStops})`,
                    };
                  }
                }
              } else baseClasses += " bg-gray-50/30";

              if (isSelected && !isPastDate) baseClasses += " font-bold z-10";

              return (
                <div key={index} className="relative h-[80px]">
                  {day !== null ? (
                    <button
                      onClick={() => !isPastDate && setSelectedDate(day)}
                      disabled={isPastDate}
                      className={baseClasses}
                      style={cellStyle}
                    >
                      {isSelected && !isPastDate && (
                        <div className="absolute inset-0 bg-[#8B0E0E]/20 z-20 pointer-events-none" />
                      )}
                      <span className="relative z-30">{day}</span>
                    </button>
                  ) : (
                    <div className="w-full h-full border-b border-r border-black bg-gray-50/30" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Details Right */}
        <div className="w-[40%] pl-8 flex flex-col h-full">
          {/* ... (Right Side Header unchanged) ... */}
          <div className="flex justify-between items-end mb-8 mt-2 shrink-0">
            <h2
              className={`${montserrat.className} text-[28px] font-semibold text-black leading-none pb-1`}
            >
              {dayName}, {selectedDate || 1}
            </h2>
            {!isTutor && (
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className={`${montserrat.className} text-[20px] font-semibold text-black hover:underline`}
              >
                + Book a Session
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-y-auto py-2 px-1">
            {isLoadingDayBookings ? (
              <div className="flex justify-center pt-10">
                <Loader2 className="animate-spin text-gray-400" />
              </div>
            ) : dayBookings.length > 0 ? (
              dayBookings.map((booking) => {
                const activeStatus = getStatusForBooking(booking);
                let displayStatus = activeStatus;

                // Set Colors
                let statusColor = "text-gray-600";
                let cardBg = "bg-[#F4E4E4]";

                if (activeStatus === "Starting...") {
                  statusColor = "text-[#EFBF04] animate-pulse";
                  cardBg = "bg-[#EFBF04]/20";
                } else if (activeStatus === "Completed") {
                  statusColor = "text-green-600";
                  cardBg = "bg-green-100";
                } else if (activeStatus === "Approved") {
                  statusColor = "text-green-600";
                  cardBg = "bg-green-100";
                } else if (activeStatus === "Pending") {
                  statusColor = "text-[#D97706]";
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
                  <div
                    key={booking.id}
                    onClick={() => handleBookingClick(booking)}
                    className={`relative w-full ${cardBg} rounded-[10px] p-4 flex flex-col gap-2 hover:-translate-y-1 hover:shadow-lg cursor-pointer group transition-all ${
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
                      <span className={`${montserrat.className} font-bold`}>
                        Subject :
                      </span>
                      <span className={`${montserrat.className} font-bold`}>
                        {booking.subject}
                      </span>
                    </div>
                    <div className="flex gap-1 text-black text-[14px]">
                      <span className={`${montserrat.className} font-bold`}>
                        {isTutor
                          ? "Student :"
                          : activeStatus === "Approved" ||
                            activeStatus === "Starting..." ||
                            activeStatus === "Completed"
                          ? "Tutor :"
                          : "Time :"}
                      </span>
                      <span className={`${montserrat.className} font-normal`}>
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
                        <span className={`${montserrat.className} font-bold`}>
                          Time :
                        </span>
                        <span className={`${montserrat.className} font-normal`}>
                          {formatTimeDisplay(
                            booking.startTime,
                            booking.endTime
                          )}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 group-hover:translate-x-1 transition-transform">
                      <MoveRight size={18} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p
                  className={`${montserrat.className} text-[16px] font-bold text-black`}
                >
                  Nothing scheduled.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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
          rejectionCount={bookingStats.rejectionCount}
          totalTutors={bookingStats.totalTutors}
        />
      )}
    </>
  );
}

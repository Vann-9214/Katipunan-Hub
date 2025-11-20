"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MoveRight } from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import { WEEKDAYS, MONTHS, getDaysInMonth, getFirstDayOfMonth } from "./Utils";
import BookingModal from "./bookingModal";
import FullDetails from "./fullDetails";
import {
  usePLCBookings,
  Booking,
} from "../../../../../supabase/Lib/PLC/usePLCBooking";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

interface PLCViewMonthProps {
  year: number;
  monthIndex: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const formatTimeDisplay = (timeStr: string) => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(":", " : ");
};

// --- Helper: Map Status to Hex Color ---
const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "#FFB74D"; // Orange
    case "Approved":
    case "Completed":
      return "#81C784"; // Green
    case "Rejected":
    case "Cancelled":
      return "#EF9A9A"; // Red (Tailwind Red-200/300 approx)
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

  useEffect(() => {
    const today = new Date();
    if (today.getFullYear() === year && today.getMonth() === monthIndex) {
      setSelectedDate(today.getDate());
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
    if (!confirm("Are you sure you want to cancel this request?")) return;
    try {
      await cancelBooking(bookingId);
      setIsRequestModalOpen(false);
    } catch (error) {
      console.error("Cancel Request Error:", error);
      alert("Failed to cancel request.");
    }
  };

  const handleApprove = async (bookingId: string) => {
    if (!confirm("Confirm this booking?")) return;
    try {
      await approveBooking(bookingId);
      setIsRequestModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to confirm request.");
    }
  };

  const handleDeny = async (bookingId: string) => {
    if (!confirm("Deny this booking?")) return;
    try {
      await denyBooking(bookingId);
      await refreshStats(bookingId);
      setSelectedBooking((prev) =>
        prev ? { ...prev, hasRejected: true } : null
      );
    } catch (err) {
      console.error(err);
      alert("Failed to deny request.");
    }
  };

  /* Grid Logic */
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const startOffset = getFirstDayOfMonth(year, monthIndex);
  const blanks: null[] = Array(startOffset).fill(null);
  const days: number[] = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalSlots: (number | null)[] = [...blanks, ...days];
  while (totalSlots.length % 7 !== 0) totalSlots.push(null);

  const currentMonthName = MONTHS[monthIndex];
  const dateObject = selectedDate
    ? new Date(year, monthIndex, selectedDate)
    : new Date(year, monthIndex, 1);
  const dayName = dateObject.toLocaleString("en-US", { weekday: "long" });
  const displayDate = selectedDate || 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <>
      <div className="w-full h-[700px] bg-white rounded-[20px] border border-gray-800 shadow-md flex overflow-hidden p-8">
        {/* Calendar Left */}
        <div className="flex-1 pr-8 flex flex-col border-r border-gray-300 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-6 px-2">
            <h2
              className={`${montserrat.className} text-[24px] font-bold text-black`}
            >
              {currentMonthName} {year}
            </h2>
            <div className="flex gap-4 text-black">
              <button
                onClick={onPrevMonth}
                className="hover:bg-gray-100 cursor-pointer p-1 rounded-full transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={onNextMonth}
                className="hover:bg-gray-100 cursor-pointer p-1 rounded-full transition-colors"
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

              // We will calculate background style dynamically
              let cellStyle: React.CSSProperties = {};
              let baseClasses = `
                w-full h-full flex items-center justify-center text-[18px] 
                transition-all duration-150 ${ptSans.className}
                border-b border-r border-black 
              `;

              if (day !== null) {
                const checkDate = new Date(year, monthIndex, day);
                if (checkDate < today) {
                  isPastDate = true;
                }

                if (isPastDate) {
                  // Past dates: Gray, disabled
                  baseClasses +=
                    " bg-gray-200 text-gray-400 cursor-not-allowed";
                } else {
                  // Future/Present dates: Calculate Colors
                  baseClasses += " cursor-pointer text-black hover:opacity-90";

                  const dateStr = getDateString(year, monthIndex, day);
                  // Get all bookings for this day
                  const bookingsOnDay = monthBookings.filter(
                    (b) => b.bookingDate === dateStr
                  );

                  // Extract unique status colors
                  const uniqueColors = Array.from(
                    new Set(bookingsOnDay.map((b) => getStatusColor(b.status)))
                  );

                  if (uniqueColors.length === 0) {
                    baseClasses += " bg-white hover:bg-gray-50";
                  } else if (uniqueColors.length === 1) {
                    // Single Color
                    cellStyle = { backgroundColor: uniqueColors[0] };
                  } else {
                    // Multiple Colors -> Gradient
                    // Calculate percentage steps: e.g., 50% for 2 colors, 33.3% for 3
                    const step = 100 / uniqueColors.length;
                    const gradientStops = uniqueColors
                      .map(
                        (color, i) => `${color} ${i * step}% ${(i + 1) * step}%`
                      )
                      .join(", ");

                    cellStyle = {
                      background: `linear-gradient(135deg, ${gradientStops})`,
                    };
                  }
                }
              } else {
                // Empty slot
                baseClasses += " bg-gray-50/30";
              }

              // Selected State Styles
              if (isSelected && !isPastDate) {
                // If it has colors, we keep the background but add a thick border or overlay
                // If no colors, we use the default selection color
                const hasColors = Object.keys(cellStyle).length > 0;

                if (hasColors) {
                  baseClasses += " font-bold z-10 ring-4 ring-black/20";
                } else {
                  baseClasses += " bg-[#8B0E0E]/20 font-bold z-10";
                }
              }

              return (
                <div key={index} className="relative h-[80px]">
                  {day !== null ? (
                    <button
                      onClick={() => {
                        if (!isPastDate) setSelectedDate(day);
                      }}
                      disabled={isPastDate}
                      className={baseClasses}
                      style={cellStyle} // Apply dynamic gradient here
                    >
                      {day}
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
          <div className="flex justify-between items-end mb-8 mt-2 shrink-0">
            <h2
              className={`${montserrat.className} text-[28px] font-semibold text-black leading-none pb-1`}
            >
              {dayName}, {displayDate}
            </h2>
            {!isTutor && (
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className={`${montserrat.className} cursor-pointer text-[20px] font-semibold text-black hover:underline leading-none`}
              >
                + Book a Session
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-y-auto py-2 px-1">
            {isLoadingDayBookings ? (
              <div className="flex items-center justify-center h-full">
                <p className={`${montserrat.className} text-gray-400`}>
                  Loading...
                </p>
              </div>
            ) : dayBookings.length > 0 ? (
              dayBookings.map((booking) => {
                let displayStatus = booking.status;
                let statusColor = "text-gray-600";

                if (
                  isTutor &&
                  booking.hasRejected &&
                  booking.status === "Pending"
                ) {
                  displayStatus = "Rejected";
                  statusColor = "text-red-600";
                } else {
                  if (booking.status === "Pending") {
                    statusColor = "text-[#D97706]";
                  } else if (booking.status === "Approved") {
                    statusColor = "text-green-600";
                  } else if (booking.status === "Rejected") {
                    statusColor = "text-red-600";
                  }
                }

                return (
                  <div
                    key={booking.id}
                    onClick={() => handleBookingClick(booking)}
                    className="relative w-full bg-[#F4E4E4] rounded-[10px] p-4 flex flex-col gap-2 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg cursor-pointer group border border-transparent hover:border-black/5 shrink-0"
                  >
                    <span
                      className={`absolute top-3 right-4 text-[12px] font-bold ${statusColor} ${montserrat.className}`}
                    >
                      {displayStatus}
                    </span>

                    {/* Subject */}
                    <div className="flex gap-1 text-black text-[14px]">
                      <span className={`${montserrat.className} font-bold`}>
                        Subject :
                      </span>
                      <span className={`${montserrat.className} font-bold`}>
                        {booking.subject}
                      </span>
                    </div>

                    {/* Dynamic Middle Line */}
                    <div className="flex gap-1 text-black text-[14px]">
                      <span className={`${montserrat.className} font-bold`}>
                        {isTutor
                          ? "Student :"
                          : booking.status === "Approved"
                          ? "Tutor :"
                          : "Requested Time :"}
                      </span>
                      <span className={`${montserrat.className} font-normal`}>
                        {isTutor
                          ? booking.Accounts?.fullName || "Unknown Student"
                          : booking.status === "Approved"
                          ? booking.Tutor?.fullName || "Unknown Tutor"
                          : formatTimeDisplay(booking.startTime)}
                      </span>
                    </div>

                    {/* Time Line (Always show for Tutor, and for Student if Approved) */}
                    {(isTutor || booking.status === "Approved") && (
                      <div className="flex gap-1 text-black text-[14px]">
                        <span className={`${montserrat.className} font-bold`}>
                          Requested Time :
                        </span>
                        <span className={`${montserrat.className} font-normal`}>
                          {formatTimeDisplay(booking.startTime)}
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-3 right-3 group-hover:translate-x-1 transition-transform">
                      <MoveRight size={18} className="text-black" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p
                  className={`${montserrat.className} text-[16px] font-bold text-black`}
                >
                  Nothing in schedule for you today.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        selectedDate={dateObject}
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
            hasRejected: selectedBooking.hasRejected, // Pass this through

            // --- ADDED: Pass the tutor name to the modal ---
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

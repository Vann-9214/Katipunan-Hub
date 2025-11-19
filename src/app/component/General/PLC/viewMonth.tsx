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

  const {
    currentUser,
    monthBookings,
    dayBookings,
    isLoadingDayBookings,
    cancelBooking,
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

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsRequestModalOpen(true);
  };

  const handleCancelRequest = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this request?")) return;
    try {
      await cancelBooking(bookingId);
      setIsRequestModalOpen(false);
    } catch (error) {
      alert("Failed to cancel request.");
    }
  };

  // Grid Logic
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

  return (
    <>
      <div className="w-full min-h-[600px] h-auto bg-white rounded-[20px] border border-gray-800 shadow-md flex overflow-hidden p-8">
        {/* Calendar Left */}
        <div className="flex-1 pr-8 flex flex-col border-r border-gray-300">
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
              let bookingStatus: string | null = null;

              if (day !== null) {
                const dateStr = getDateString(year, monthIndex, day);
                const booking = monthBookings.find(
                  (b) => b.bookingDate === dateStr
                );
                if (booking) bookingStatus = booking.status;
              }

              // 1. Determine Status Color First
              let statusClass = "bg-white text-black hover:bg-gray-50";

              if (bookingStatus === "Pending") {
                statusClass = "bg-[#FFB74D] text-black hover:bg-[#FFB74D]/90"; // Orange
              } else if (
                bookingStatus === "Approved" ||
                bookingStatus === "Completed"
              ) {
                statusClass = "bg-[#81C784] text-black hover:bg-[#81C784]/90"; // Green
              } else if (
                bookingStatus === "Rejected" ||
                bookingStatus === "Cancelled"
              ) {
                statusClass = "bg-red-200 text-black hover:bg-red-300"; // Red
              }

              // 2. Prepare Base Classes
              let finalClass = `
                w-full h-full flex items-center justify-center text-[18px] 
                transition-colors duration-150 ${ptSans.className}
                border-b border-r border-black 
              `;

              // 3. Apply Logic: Selection vs Status
              if (isSelected) {
                if (bookingStatus) {
                  finalClass += ` ${statusClass} cursor-pointer font-bold z-10`;
                } else {
                  finalClass += "cursor-pointer bg-[#8B0E0E]/20 font-bold z-10";
                }
              } else {
                finalClass += `cursor-pointer ${statusClass} border-b border-r border-black`;
              }

              return (
                <div key={index} className="relative h-[80px]">
                  {day !== null && (
                    <button
                      onClick={() => setSelectedDate(day)}
                      className={finalClass}
                    >
                      {day}
                    </button>
                  )}
                  {!day && (
                    <div className="w-full h-full border-b border-r border-black bg-gray-50/30" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Details Right */}
        <div className="w-[40%] pl-8 flex flex-col">
          <div className="flex justify-between items-end mb-8 mt-2">
            <h2
              className={`${montserrat.className} text-[28px] font-semibold text-black leading-none pb-1`}
            >
              {dayName}, {displayDate}
            </h2>
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className={`${montserrat.className} cursor-pointer text-[20px] font-semibold text-black hover:underline leading-none`}
            >
              + Book a Session
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-y-auto py-2 px-1">
            {isLoadingDayBookings ? (
              <div className="flex items-center justify-center h-full">
                <p className={`${montserrat.className} text-gray-400`}>
                  Loading...
                </p>
              </div>
            ) : dayBookings.length > 0 ? (
              dayBookings.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => handleBookingClick(booking)}
                  className="relative w-full bg-[#F4E4E4] rounded-[10px] p-4 flex flex-col gap-2 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg cursor-pointer group border border-transparent hover:border-black/5"
                >
                  <span
                    className={`absolute top-3 right-4 text-[12px] font-bold ${
                      booking.status === "Pending"
                        ? "text-[#D97706]"
                        : booking.status === "Approved"
                        ? "text-green-600"
                        : booking.status === "Rejected"
                        ? "text-red-600"
                        : "text-gray-600"
                    } ${montserrat.className}`}
                  >
                    {booking.status}
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
                      Time :
                    </span>
                    <span className={`${montserrat.className} font-normal`}>
                      {formatTimeDisplay(booking.startTime)}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 group-hover:translate-x-1 transition-transform">
                    <MoveRight size={18} className="text-black" />
                  </div>
                </div>
              ))
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
            studentName: currentUser.fullName || "Student",
            studentCourse: currentUser.course || "Course",
            studentYear: currentUser.year || "Year",
            studentIDNum: currentUser.studentID || "ID",
            avatarURL: currentUser.avatarURL,
          }}
          onCancelRequest={handleCancelRequest}
        />
      )}
    </>
  );
}

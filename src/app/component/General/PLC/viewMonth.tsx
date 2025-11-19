"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, MoveRight } from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import { WEEKDAYS, MONTHS, getDaysInMonth, getFirstDayOfMonth } from "./Utils";
import BookingModal from "./bookingModal";
import FullDetails from "./fullDetails"; // Import the new modal
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient";
import { getCurrentUserDetails } from "../../../../../supabase/Lib/General/getUser";
import type { User } from "../../../../../supabase/Lib/General/user";

/* Fonts */
const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

/* Types */
interface PLCViewMonthProps {
  year: number;
  monthIndex: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

interface Booking {
  id: string;
  subject: string;
  startTime: string;
  status: string;
  description?: string;
  bookingDate: string;
  studentId: string;
}

/* Helpers */
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

/* Main Component */
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

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  /* Effects */
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUserDetails();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const today = new Date();
    if (today.getFullYear() === year && today.getMonth() === monthIndex) {
      setSelectedDate(today.getDate());
    } else {
      setSelectedDate(1);
    }
  }, [year, monthIndex]);

  const fetchBookings = useCallback(async () => {
    if (!currentUser || !selectedDate) return;

    setIsLoadingBookings(true);

    const monthStr = String(monthIndex + 1).padStart(2, "0");
    const dayStr = String(selectedDate).padStart(2, "0");
    const dateQuery = `${year}-${monthStr}-${dayStr}`;

    const { data, error } = await supabase
      .from("PLCBookings")
      .select(
        "id, subject, startTime, status, description, bookingDate, studentId"
      )
      .eq("studentId", currentUser.id)
      .eq("bookingDate", dateQuery);

    if (error) {
      console.error("Error fetching bookings:", error);
    } else {
      setBookings(data || []);
    }

    setIsLoadingBookings(false);
  }, [currentUser, selectedDate, monthIndex, year]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /* Handlers */
  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsRequestModalOpen(true);
  };

  const handleCancelRequest = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this request?")) return;

    const { error } = await supabase
      .from("PLCBookings")
      .delete()
      .eq("id", bookingId);

    if (error) {
      alert("Failed to cancel request.");
      console.error(error);
    } else {
      setIsRequestModalOpen(false);
      fetchBookings(); // Refresh list
    }
  };

  /* Grid Logic */
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const startOffset = getFirstDayOfMonth(year, monthIndex);
  const blanks: null[] = Array(startOffset).fill(null);
  const days: number[] = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalSlots: (number | null)[] = [...blanks, ...days];

  while (totalSlots.length % 7 !== 0) {
    totalSlots.push(null);
  }

  const currentMonthName = MONTHS[monthIndex];
  const dateObject = selectedDate
    ? new Date(year, monthIndex, selectedDate)
    : new Date(year, monthIndex, 1);
  const dayName = dateObject.toLocaleString("en-US", { weekday: "long" });
  const displayDate = selectedDate || 1;

  /* Render */
  return (
    <>
      <div className="w-full min-h-[600px] h-auto bg-white rounded-[20px] border border-gray-800 shadow-md flex overflow-hidden p-8">
        {/* Left Section */}
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
                className="hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={onNextMonth}
                className="hover:bg-gray-100 p-1 rounded-full transition-colors"
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
              return (
                <div
                  key={index}
                  className="border-b border-r border-black relative h-[80px]"
                >
                  {day !== null && (
                    <button
                      onClick={() => setSelectedDate(day)}
                      className={`
                        w-full h-full flex items-center justify-center text-[18px]
                        transition-colors duration-150
                        ${ptSans.className}
                        ${
                          isSelected
                            ? "bg-[#E6C4C4] font-bold text-black"
                            : "hover:bg-gray-50 text-black"
                        }
                      `}
                    >
                      {day}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section */}
        <div className="w-[40%] pl-8 flex flex-col">
          <div className="flex justify-between items-end mb-8 mt-2">
            <h2
              className={`${montserrat.className} text-[24px] font-bold text-black leading-none pb-1`}
            >
              {dayName}, {displayDate}
            </h2>
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className={`${montserrat.className} text-[14px] font-bold text-black hover:underline leading-none`}
            >
              + Book a Session
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
            {isLoadingBookings ? (
              <div className="flex items-center justify-center h-full">
                <p className={`${montserrat.className} text-gray-400`}>
                  Loading schedule...
                </p>
              </div>
            ) : bookings.length > 0 ? (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => handleBookingClick(booking)}
                  className="relative w-full bg-[#F4E4E4] rounded-[10px] p-4 flex flex-col gap-2 transition-all hover:shadow-md cursor-pointer group"
                >
                  <span
                    className={`absolute top-3 right-4 text-[12px] font-bold ${
                      booking.status === "Pending"
                        ? "text-[#D97706]"
                        : booking.status === "Approved"
                        ? "text-green-600"
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
                      Requested Time :
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

      {/* Create Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        selectedDate={dateObject}
        onSuccess={() => {
          fetchBookings();
        }}
      />

      {/* View Request Modal */}
      {selectedBooking && currentUser && (
        <FullDetails
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          booking={{
            ...selectedBooking,
            // Inject current user details since they are viewing their own request
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

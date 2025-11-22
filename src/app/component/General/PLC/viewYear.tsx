"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import { MONTHS, getDaysInMonth, getFirstDayOfMonth } from "../PLC/Utils";
import {
  usePLCYearBookings,
  MonthBooking,
} from "../../../../../supabase/Lib/PLC/usePLCBooking";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400"] });

interface PLCViewYearProps {
  year: number;
  onMonthClick: (monthIndex: number) => void;
  onPrevYear: () => void;
  onNextYear: () => void;
}

// --- Helper: Map Status to Hex Color ---
const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "#FFB74D";
    case "Approved":
      return "#81C784";
    case "Completed":
      return "#81C784";
    case "Rejected":
      return "#EF9A9A";
    case "Starting...":
      return "#FFD239"; // Gold
    default:
      return "#FFFFFF";
  }
};

export default function PLCViewYear({
  year,
  onMonthClick,
  onPrevYear,
  onNextYear,
}: PLCViewYearProps) {
  // Data Fetching
  const { yearBookings, getDateString } = usePLCYearBookings(year);

  // --- 1. Add Realtime Clock ---
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. Add Status Logic ---
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

  return (
    <div className="bg-white rounded-[30px] border border-black/20 shadow-sm p-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-center gap-12 mb-8 text-black relative">
        <button
          onClick={onPrevYear}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <span className={`${montserrat.className} text-[32px] font-bold`}>
          {year}
        </span>
        <button
          onClick={onNextYear}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-x-6 gap-y-8">
        {MONTHS.map((monthName, monthIndex) => {
          const daysInMonth = getDaysInMonth(year, monthIndex);
          const startOffset = getFirstDayOfMonth(year, monthIndex);
          const totalSlots = 42;
          const dayList = Array.from({ length: daysInMonth }, (_, i) => i + 1);
          const gridCells = [
            ...Array(startOffset).fill(null),
            ...dayList,
            ...Array(totalSlots - (startOffset + daysInMonth)).fill(null),
          ].slice(0, 42);

          return (
            <div
              key={monthName}
              onClick={() => onMonthClick(monthIndex)}
              className="border border-black rounded-[20px] p-4 bg-white cursor-pointer hover:shadow-lg hover:border-[#8B0E0E] transition-all flex flex-col"
            >
              <h3
                className={`${montserrat.className} text-center font-bold text-black text-[18px] mb-2`}
              >
                {monthName}
              </h3>
              <div className="grid grid-cols-7 mb-1">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <div
                    key={i}
                    className={`${montserrat.className} text-center text-[12px] font-semibold text-gray-600`}
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 border-t border-l border-gray-300">
                {gridCells.map((day, i) => {
                  let cellStyle: React.CSSProperties = {};
                  let className = `h-[26px] flex items-center justify-center border-b border-r border-gray-300 text-[11px] ${ptSans.className}`;

                  if (day !== null) {
                    className += " text-black";
                    const dateStr = getDateString(year, monthIndex, day);
                    const bookingsOnDay = yearBookings.filter(
                      (b) => b.bookingDate === dateStr
                    );

                    // --- 3. USE DYNAMIC STATUS ---
                    const uniqueColors = Array.from(
                      new Set(
                        bookingsOnDay.map((b) =>
                          getStatusColor(getStatusForBooking(b))
                        )
                      )
                    );

                    if (uniqueColors.length === 0) {
                      className += " bg-transparent";
                    } else if (uniqueColors.length === 1) {
                      cellStyle = { backgroundColor: uniqueColors[0] };
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
                      };
                    }
                  } else {
                    className += " bg-transparent";
                  }

                  return (
                    <div key={i} className={className} style={cellStyle}>
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

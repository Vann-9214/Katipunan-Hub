"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Montserrat, PT_Sans } from "next/font/google";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Holiday,
  PostedEvent,
  PersonalEvent,
} from "@/app/component/General/Calendar/types";
import { getEventLabel, getEventColor } from "./calendarUtils";
import EventDetailsModal from "@/app/component/General/Calendar/EventDetailsModal";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface CalendarViewsProps {
  viewMode: "month" | "year";
  currentDate: Date;
  year: number;
  monthName: string;
  daysArray: (number | null)[];
  holidaysForCurrentMonth: Holiday[];
  holidaysForYear: Holiday[];
  personalEvents: PersonalEvent[];
  postedEvents: PostedEvent[];
  selectedDay: number | null;
  todayDate: number;
  isCurrentMonth: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (day: number) => void;
  onMonthClick: (monthIndex: number) => void;
}

export default function CalendarViews({
  viewMode,
  currentDate,
  year,
  monthName,
  daysArray,
  holidaysForCurrentMonth,
  holidaysForYear,
  personalEvents,
  postedEvents,
  selectedDay,
  todayDate,
  isCurrentMonth,
  onPrevMonth,
  onNextMonth,
  onDayClick,
  onMonthClick,
}: CalendarViewsProps) {
  const today = new Date();
  const [selectedEvent, setSelectedEvent] = useState<Holiday | PostedEvent | PersonalEvent | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);

  const handleEventClick = (event: Holiday | PostedEvent | PersonalEvent, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent day click event
    
    // Get click position and adjust to show popup near the click
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPopupPosition({
      x: rect.right + 10, // 10px to the right of the event
      y: rect.top,
    });
    setSelectedEvent(event);
  };

  const handleClosePopup = () => {
    setSelectedEvent(null);
    setPopupPosition(null);
  };

  return (
    <>
      <div className={`relative mt-[20px] bg-white rounded-lg border-4 border-[#800000] shadow-xl transition-all duration-300 ${
        viewMode === "year" ? "w-[1400px]" : "w-[922px]"
      }`}>
        {/* Calendar Header */}
        <div
          className={`${montserrat.className} flex justify-between items-center px-10 py-3 bg-[#800000] text-white text-[24px] font-semibold rounded-t-md`}
        >
          <button
            onClick={onPrevMonth}
            className="hover:text-[#FFD700] transition"
          >
            <ChevronLeft size={28} />
          </button>
          <span>{viewMode === "month" ? `${monthName} ${year}` : year}</span>
          <button
            onClick={onNextMonth}
            className="hover:text-[#FFD700] transition"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* Month View */}
        {viewMode === "month" && (
          <>
            <div
              className={`${ptSans.className} grid grid-cols-7 text-center font-bold text-gray-700 mt-3 text-[15px] px-6`}
            >
              {[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-4 mt-3 px-6 pb-6">
              {daysArray.map((day, index) => {
                if (!day) {
                  return (
                    <div key={index} className="w-[85px] h-[85px] opacity-30" />
                  );
                }

                const isToday = isCurrentMonth && day === todayDate;

                const dayHolidays = holidaysForCurrentMonth.filter(
                  (h) => h.day === day
                );
                const dayEvents = [
                  ...personalEvents.filter(
                    (e) =>
                      e.year === year &&
                      e.month === currentDate.getMonth() + 1 &&
                      e.day === day
                  ),
                  ...postedEvents.filter(
                    (e) =>
                      e.year === year &&
                      e.month === currentDate.getMonth() + 1 &&
                      e.day === day
                  ),
                ];

                const allDayEvents = [...dayHolidays, ...dayEvents];

                return (
                  <div
                    key={index}
                    className={`relative w-[85px] h-[85px] flex flex-col items-center p-1 cursor-pointer`}
                    onClick={() => onDayClick(day)}
                  >
                    {isToday && (
                      <div className="absolute inset-0 border-4 border-[#FFD700] rounded-md pointer-events-none" />
                    )}
                    <Image
                      src="/Date Box.svg"
                      alt="Date Box"
                      width={85}
                      height={85}
                      className="absolute top-0 left-0 select-none"
                    />
                    <span
                      className={`${
                        ptSans.className
                      } text-[14px] font-bold absolute top-[6px] left-1/2 -translate-x-1/2 ${
                        selectedDay === day ? "text-[#FFD700]" : "text-[#800000]"
                      }`}
                    >
                      {day}
                    </span>

                    <div className="absolute top-[25px] w-[75px] h-[50px] flex flex-col gap-[2px] overflow-hidden">
                      {allDayEvents.map((event, i) => (
                        <div
                          key={i}
                          className="text-[10px] text-center rounded-md px-[2px] py-[1px] text-black truncate cursor-pointer hover:brightness-90 hover:scale-105 transition-all"
                          style={{ backgroundColor: getEventColor(event, i) }}
                          onClick={(e) => handleEventClick(event, e)}
                        >
                          {getEventLabel(event)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Year View */}
        {viewMode === "year" && (
          <div className="grid grid-cols-4 gap-6 p-8 pb-10">
            {Array.from({ length: 12 }, (_, monthIndex) => {
              const monthDate = new Date(year, monthIndex, 1);
              const thisMonthName = monthDate.toLocaleString("default", {
                month: "long",
              });
              const firstDayOfMonth = monthDate.getDay();
              const daysInThisMonth = new Date(
                year,
                monthIndex + 1,
                0
              ).getDate();
              const monthDays = Array.from({ length: 35 }, (_, i) => {
                const day = i - firstDayOfMonth + 1;
                return day > 0 && day <= daysInThisMonth ? day : null;
              });

              const monthHolidays = holidaysForYear.filter(
                (h) => h.month === monthIndex + 1
              );
              const monthEvents = [
                ...personalEvents.filter(
                  (e) => e.year === year && e.month === monthIndex + 1
                ),
                ...postedEvents.filter(
                  (e) => e.year === year && e.month === monthIndex + 1
                ),
              ];
              const hasEvents = monthHolidays.length > 0 || monthEvents.length > 0;

              return (
                <div
                  key={monthIndex}
                  className={`${
                    ptSans.className
                  } bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 ${
                    hasEvents ? "border-[#FFD700]" : "border-gray-200"
                  }`}
                  onClick={() => onMonthClick(monthIndex)}
                >
                  <h3 className="text-center font-bold text-[#800000] mb-3 text-[16px]">
                    {thisMonthName}
                  </h3>
                  <div className="grid grid-cols-7 gap-[3px] mb-2">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                      <div
                        key={i}
                        className="text-[11px] text-center text-gray-600 font-semibold"
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-[3px]">
                    {monthDays.map((day, i) => {
                      if (!day)
                        return (
                          <div key={i} className="text-[11px] text-center py-1" />
                        );
                      const dayHasHoliday = monthHolidays.some(
                        (h) => h.day === day
                      );
                      const dayHasEvent = monthEvents.some((e) => e.day === day);
                      const isToday =
                        today.getFullYear() === year &&
                        today.getMonth() === monthIndex &&
                        today.getDate() === day;

                      return (
                        <div
                          key={i}
                          className={`text-[11px] text-center py-1 rounded ${
                            isToday
                              ? "bg-[#FFD700] font-bold text-black"
                              : dayHasHoliday || dayHasEvent
                              ? "bg-[#800000] text-white font-semibold"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Event Details Popup */}
      <EventDetailsModal
        event={selectedEvent}
        position={popupPosition}
        onClose={handleClosePopup}
      />
    </>
  );
}
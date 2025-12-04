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
  weight: ["500", "600", "700"],
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
  const [selectedEvent, setSelectedEvent] = useState<
    Holiday | PostedEvent | PersonalEvent | null
  >(null);
  const [popupPosition, setPopupPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleEventHover = (
    event: Holiday | PostedEvent | PersonalEvent,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPopupPosition({
      x: rect.right + 10,
      y: rect.top,
    });
    setSelectedEvent(event);
  };

  const handleEventLeave = () => {
    // Modal handles closing
  };

  const handleClosePopup = () => {
    setSelectedEvent(null);
    setPopupPosition(null);
  };

  return (
    <>
      <div
        className={`relative flex flex-col bg-white rounded-[24px] shadow-2xl transition-all duration-300 overflow-hidden ${
          viewMode === "year" ? "w-[1272px]" : "w-[922px]"
        }`}
      >
        {/* === Redesigned Header (Matches Posts/PLC Gradient) === */}
        <div
          className={`${montserrat.className} flex justify-between items-center px-8 py-5 bg-gradient-to-r from-[#8B0E0E] to-[#5e0a0a] text-white`}
        >
          <button
            onClick={onPrevMonth}
            className="p-2 hover:bg-white/10 rounded-full transition-all text-white/90 hover:text-[#FFD700]"
          >
            <ChevronLeft size={28} />
          </button>

          <div className="flex flex-col items-center">
            <span className="text-[24px] font-bold tracking-wide">
              {viewMode === "month" ? monthName : year}
            </span>
            {viewMode === "month" && (
              <span className="text-[14px] font-medium opacity-80">{year}</span>
            )}
          </div>

          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-white/10 rounded-full transition-all text-white/90 hover:text-[#FFD700]"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* === Month View Grid === */}
        {viewMode === "month" && (
          <div className="p-6">
            {/* Days Header */}
            <div
              className={`${montserrat.className} grid grid-cols-7 text-center mb-4`}
            >
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d, i) => (
                <div
                  key={i}
                  className="text-[12px] font-bold text-gray-400 tracking-widest"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-7 gap-4">
              {daysArray.map((day, index) => {
                if (!day) {
                  return <div key={index} className="w-[85px] h-[85px]" />;
                }

                const isToday = isCurrentMonth && day === todayDate;
                const isSelected = selectedDay === day;

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
                    className={`group relative w-[85px] h-[85px] flex flex-col items-center p-1 cursor-pointer rounded-2xl transition-all duration-200 border border-transparent hover:border-gray-100 hover:shadow-lg hover:-translate-y-1 ${
                      isSelected ? "bg-red-50" : "bg-white"
                    }`}
                    onClick={() => onDayClick(day)}
                  >
                    {/* Today Ring Indicator */}
                    {isToday && (
                      <div className="absolute inset-0 rounded-2xl ring-2 ring-[#FFD700] ring-offset-2 z-0" />
                    )}

                    {/* Date Box Image (Optional Background decoration) */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-10 transition-opacity">
                      <Image
                        src="/Date Box.svg"
                        alt="bg"
                        width={85}
                        height={85}
                        className="opacity-50"
                      />
                    </div>

                    {/* Date Number */}
                    <span
                      className={`${
                        montserrat.className
                      } text-[16px] font-bold z-10 mt-1 transition-colors ${
                        isToday
                          ? "text-[#FFD700]"
                          : isSelected
                          ? "text-[#8B0E0E]"
                          : "text-gray-700 group-hover:text-[#8B0E0E]"
                      }`}
                    >
                      {day}
                    </span>

                    {/* Events List */}
                    <div className="w-full flex flex-col gap-[2px] mt-1 overflow-hidden z-10 px-1">
                      {allDayEvents.slice(0, 3).map((event, i) => (
                        <div
                          key={i}
                          className="text-[9px] font-semibold text-center rounded-[4px] py-[1px] text-black truncate shadow-sm transition-transform hover:scale-105"
                          style={{ backgroundColor: getEventColor(event, i) }}
                          onMouseEnter={(e) => handleEventHover(event, e)}
                          onMouseLeave={handleEventLeave}
                        >
                          {getEventLabel(event)}
                        </div>
                      ))}
                      {allDayEvents.length > 3 && (
                        <div className="text-[8px] text-center text-gray-400">
                          +{allDayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* === Year View Grid === */}
        {viewMode === "year" && (
          <div className="grid grid-cols-3 gap-x-8 gap-y-10 p-10 bg-gray-50/50">
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

              // (Filter logic same as before...)
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

              return (
                <div
                  key={monthIndex}
                  className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-[#FFD700]/30 hover:-translate-y-1"
                  onClick={() => onMonthClick(monthIndex)}
                >
                  <h3
                    className={`${montserrat.className} text-center font-bold text-[#8B0E0E] mb-3`}
                  >
                    {thisMonthName}
                  </h3>

                  {/* Mini Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                      <div
                        key={i}
                        className="text-[9px] text-center text-gray-400 font-bold mb-1"
                      >
                        {d}
                      </div>
                    ))}
                    {monthDays.map((day, i) => {
                      if (!day) return <div key={i} />;

                      const dayHasHoliday = monthHolidays.some(
                        (h) => h.day === day
                      );
                      const dayHasEvent = monthEvents.some(
                        (e) => e.day === day
                      );
                      const isToday =
                        today.getFullYear() === year &&
                        today.getMonth() === monthIndex &&
                        today.getDate() === day;

                      return (
                        <div
                          key={i}
                          className={`text-[10px] h-6 w-6 flex items-center justify-center mx-auto rounded-full ${
                            isToday
                              ? "bg-[#FFD700] text-white font-bold shadow-md"
                              : dayHasHoliday || dayHasEvent
                              ? "bg-[#8B0E0E] text-white"
                              : "text-gray-600 hover:bg-gray-100"
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

      <EventDetailsModal
        event={selectedEvent}
        position={popupPosition}
        onClose={handleClosePopup}
      />
    </>
  );
}

"use client";

import React from "react";
import Image from "next/image";
import { PT_Sans } from "next/font/google";
import {
  PostedEvent,
  PersonalEvent,
  Holiday,
} from "@/app/component/General/Calendar/types";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface ReminderPanelProps {
  reminders: string[];
  setReminders: React.Dispatch<React.SetStateAction<string[]>>;
  newReminder: string;
  setNewReminder: React.Dispatch<React.SetStateAction<string>>;
  selectedDay: number | null;
  monthName: string;
  todayDate: number;
  year: number;
  currentMonth: number;
  postedEvents: PostedEvent[];
  personalEvents: PersonalEvent[];
  holidays: Holiday[];
}

export default function ReminderPanel({
  reminders,
  setReminders,
  newReminder,
  setNewReminder,
  selectedDay,
  monthName,
  todayDate,
  year,
  currentMonth,
  postedEvents,
  personalEvents,
  holidays,
}: ReminderPanelProps) {
  const handleAddReminder = () => {
    if (newReminder.trim() !== "") {
      setReminders((prev) => [...prev, newReminder]);
      setNewReminder("");
    }
  };

  const handleDeleteReminder = (index: number) => {
    setReminders((prev) => prev.filter((_, idx) => idx !== index));
  };

  const displayDay = selectedDay || todayDate;
  const formattedDate = `${displayDay} ${monthName.slice(0, 3)}`;

  // Get all events for the selected/current day
  const eventsForDay = [
    // Posted events (Global/Course)
    ...postedEvents.filter(
      (e) =>
        e.year === year && e.month === currentMonth + 1 && e.day === displayDay
    ),
    // Personal events
    ...personalEvents.filter(
      (e) =>
        e.year === year && e.month === currentMonth + 1 && e.day === displayDay
    ),
    // Holidays
    ...holidays.filter(
      (h) => h.month === currentMonth + 1 && h.day === displayDay
    ),
  ];

  const getEventLabel = (
    event: Holiday | PostedEvent | PersonalEvent | string
  ): string => {
    if (typeof event === "string") return event;

    // Checks if 'title' exists (Common in PostedEvent and PersonalEvent)
    if ("title" in event) {
      return event.title;
    }

    // Checks if 'name' exists (Common in Holiday)
    if ("name" in event) {
      return event.name;
    }

    return "";
  };

  const getEventType = (
    event: Holiday | PostedEvent | PersonalEvent | string
  ): string => {
    // Handle string reminders first
    if (typeof event === "string") return "Reminder";

    // Check for 'audience' to identify PostedEvent
    if ("audience" in event) {
      return event.audience === "Global"
        ? "Global Event"
        : `Course: ${event.course}`;
    }

    // Check for Holiday specific props (name exists, but title does not)
    if (
      "name" in event &&
      "month" in event &&
      "day" in event &&
      !("title" in event)
    ) {
      return "Holiday";
    }

    // Default fallback
    return "Personal Event";
  };

  return (
    <div
      className={`${ptSans.className} absolute`}
      style={{
        left: "1000px",
        top: "230px",
        width: "350px",
        height: "650px",
        backgroundColor: "#F4F4F4",
        borderRadius: "25px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-[18px] font-bold text-[#800000]">Reminders</h2>
        <div
          className="flex items-center justify-center rounded-full bg-[#800000] cursor-pointer hover:bg-[#A52A2A] transition"
          style={{ width: "43px", height: "40px" }}
          onClick={handleAddReminder}
        >
          <Image src="/Bellplus.svg" alt="Bell Icon" width={30} height={30} />
        </div>
      </div>

      {/* Date + Event count label */}
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
        <span className="text-[15px] text-gray-700 font-semibold">
          {formattedDate}
        </span>
        <div
          className="flex items-center justify-center text-[14px] font-semibold text-black rounded-full"
          style={{
            backgroundColor: "#D9D9D9",
            width: "120px",
            height: "26px",
          }}
        >
          {eventsForDay.length} event{eventsForDay.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Scrollable events/reminders list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {/* Events for the day */}
        {eventsForDay.length > 0 && (
          <div className="mb-4">
            <h3 className="text-[13px] font-bold text-[#800000] mb-2">
              Events on this day:
            </h3>
            {eventsForDay.map((event, i) => (
              <div
                key={`event-${i}`}
                className="bg-[#FFE5B4] px-3 py-2 rounded-lg text-[13px] mb-2"
              >
                <div className="font-semibold text-[#800000]">
                  {getEventLabel(event)}
                </div>
                <div className="text-[11px] text-gray-600 mt-1">
                  {getEventType(event)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom reminders */}
        <div>
          <h3 className="text-[13px] font-bold text-[#800000] mb-2">
            Custom Reminders:
          </h3>
          {reminders.length === 0 ? (
            <div className="text-[14px] text-gray-500 italic">
              No custom reminders
            </div>
          ) : (
            reminders.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-[#D9D9D9] px-3 py-2 rounded-full text-[14px] font-medium text-[#800000] mb-2"
              >
                <span className="truncate">{r}</span>
                <button
                  onClick={() => handleDeleteReminder(i)}
                  className="text-[#800000] hover:text-red-600 font-bold text-[16px] ml-2"
                  suppressHydrationWarning
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add input pinned bottom */}
      <div
        className="flex items-center justify-between bg-[#D9D9D9] rounded-full px-3 mt-3 flex-shrink-0"
        style={{ width: "100%", height: "36px" }}
      >
        <input
          type="text"
          value={newReminder}
          onChange={(e) => setNewReminder(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddReminder()}
          placeholder={`Add reminder on ${formattedDate}`}
          className="flex-1 text-[14px] text-gray-700 outline-none bg-transparent"
          suppressHydrationWarning
        />
        <button
          onClick={handleAddReminder}
          className="flex items-center justify-center rounded-full bg-gray-300 hover:bg-gray-400 transition"
          style={{ width: 32, height: 32 }}
          suppressHydrationWarning
        >
          <Image
            src="/Bellplus.svg"
            alt="Add Reminder"
            width={18}
            height={18}
          />
        </button>
      </div>
    </div>
  );
}

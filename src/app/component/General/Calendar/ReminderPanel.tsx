// ReminderPanel.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PT_Sans } from "next/font/google";
import {
  PostedEvent,
  PersonalEvent,
  Holiday,
} from "@/app/component/General/Calendar/types";
import PanelToggleSwitch from "./PanelToggleSwitch";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

type PanelType = "Schedule" | "Reminder";

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
  isAdmin: boolean;
  onDeletePostedEvent?: (eventId: string) => void;
  setPersonalEvents?: React.Dispatch<React.SetStateAction<PersonalEvent[]>>;
  // State control from parent
  isMaximized: boolean; // Use prop to control maximized state
  onMaximizeToggle: (panel: PanelType | null) => void; // Function to notify parent of minimize/maximize
  currentMaximizedPanel: PanelType; // Only needed if maximized, but included for completeness
  onPanelSwitch: (panel: PanelType) => void; // Function to switch panels when maximized
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
  isAdmin,
  onDeletePostedEvent,
  setPersonalEvents,
  isMaximized, // Now controlled by prop
  onMaximizeToggle, // Function from parent
  currentMaximizedPanel,
  onPanelSwitch,
}: ReminderPanelProps) {
  // Local state isMaximized removed, controlled by prop

  // Simplified maximize handler that communicates with the parent
  const handleToggleMaximize = () => {
    onMaximizeToggle(isMaximized ? null : "Reminder");
  };

  const handleAddReminder = () => {
    if (newReminder.trim() !== "") {
      setReminders((prev) => [...prev, newReminder]);
      setNewReminder("");
    }
  };

  const handleDeleteReminder = (index: number) => {
    setReminders((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleDeletePersonalEvent = (event: PersonalEvent) => {
    if (setPersonalEvents) {
      setPersonalEvents((prev) =>
        prev.filter(
          (e) =>
            !(
              e.name === event.name &&
              e.year === event.year &&
              e.month === event.month &&
              e.day === event.day
            )
        )
      );
    }
  };

  const displayDay = selectedDay || todayDate;
  const formattedDate = `${displayDay} ${monthName.slice(0, 3)}`;

  const postedEventsForDay = postedEvents.filter(
    (e) =>
      e.year === year && e.month === currentMonth + 1 && e.day === displayDay
  );

  const personalEventsForDay = personalEvents.filter(
    (e) =>
      e.year === year && e.month === currentMonth + 1 && e.day === displayDay
  );

  const holidaysForDay = holidays.filter(
    (h) => h.month === currentMonth + 1 && h.day === displayDay
  );

  const totalEvents =
    postedEventsForDay.length +
    personalEventsForDay.length +
    holidaysForDay.length;

  const getEventLabel = (
    event: Holiday | PostedEvent | PersonalEvent | string
  ): string => {
    if (typeof event === "string") return event;
    if ("title" in event) return event.title;
    if ("name" in event) return event.name;
    return "";
  };

  const getEventType = (
    event: Holiday | PostedEvent | PersonalEvent | string
  ): string => {
    if (typeof event === "string") return "Reminder";
    if ("audience" in event) {
      return event.audience === "Global"
        ? "Global Event"
        : `Course: ${event.course}`;
    }
    if (
      "name" in event &&
      "month" in event &&
      "day" in event &&
      !("title" in event) &&
      !("year" in event)
    ) {
      return "Holiday";
    }
    return "Personal Event";
  };

  const panelContent = (
    <div
      className={`${ptSans.className} ${
        isMaximized ? "" : "absolute"
      } flex flex-col overflow-hidden`}
      style={
        isMaximized
          ? {
              width: "800px",
              height: "80vh",
              maxHeight: "900px",
              backgroundColor: "#F4F4F4",
              borderRadius: "25px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              padding: "30px",
            }
          : {
              left: "1000px",
              top: "230px",
              width: "440px",
              height: "650px",
              backgroundColor: "#F4F4F4",
              borderRadius: "25px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              padding: "20px",
            }
      }
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2
          className={`font-bold text-[#800000] ${
            isMaximized ? "text-[32px]" : "text-[25px]"
          }`}
        >
          Reminders
        </h2>

        {/* === MAXIMIZED TOGGLE SWITCH === */}
        {isMaximized && (
            <PanelToggleSwitch
                currentPanel={currentMaximizedPanel}
                onPanelChange={onPanelSwitch}
            />
        )}
        {/* =============================== */}

        <div className="flex gap-2 items-center">
          <button
            onClick={handleToggleMaximize} // Use parent handler
            className="flex items-center justify-center rounded-full bg-[#800000] hover:bg-[#A52A2A] transition"
            style={{ width: "43px", height: "40px" }}
            title={isMaximized ? "Minimize" : "Maximize"}
          >
            <span className="text-white text-[20px] font-bold">
              {isMaximized ? "−" : "⛶"}
            </span>
          </button>
          <div
            className="flex items-center justify-center rounded-full bg-[#800000] cursor-pointer hover:bg-[#A52A2A] transition"
            style={{ width: "43px", height: "40px" }}
            onClick={handleAddReminder}
          >
            <Image
              src="/Bellplus.svg"
              alt="Bell Icon"
              width={30}
              height={30}
            />
          </div>
        </div>
      </div>

      {/* Date + Event count label */}
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
        <span
          className={`text-gray-700 font-semibold ${
            isMaximized ? "text-[24px]" : "text-[20px]"
          }`}
        >
          {formattedDate}
        </span>
        <div
          className="flex items-center justify-center font-semibold text-black rounded-full"
          style={{
            backgroundColor: "#D9D9D9",
            width: isMaximized ? "140px" : "120px",
            height: isMaximized ? "32px" : "26px",
            fontSize: isMaximized ? "20px" : "18px",
          }}
        >
          {totalEvents} event{totalEvents !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Scrollable events/reminders list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {totalEvents > 0 && (
          <div className="mb-4">
            <h3
              className={`font-bold text-[#800000] mb-2 ${
                isMaximized ? "text-[20px]" : "text-[16px]"
              }`}
            >
              Events on this day:
            </h3>

            {/* Holidays */}
            {holidaysForDay.map((event, i) => (
              <div
                key={`holiday-${i}`}
                className={`bg-[#FFE5B4] px-3 py-2 rounded-lg mb-2 flex justify-between items-start ${
                  isMaximized ? "text-[18px] py-3" : "text-[16px]"
                }`}
              >
                <div className="flex-1">
                  <div className="font-semibold text-[#800000]">
                    {getEventLabel(event)}
                  </div>
                  <div
                    className={`text-gray-600 mt-1 ${
                      isMaximized ? "text-[16px]" : "text-[14px]"
                    }`}
                  >
                    {getEventType(event)}
                  </div>
                </div>
              </div>
            ))}

            {/* Posted Events */}
            {postedEventsForDay.map((event, i) => (
              <div
                key={`posted-${i}`}
                className={`bg-[#C4E1A4] px-3 py-2 rounded-lg mb-2 flex justify-between items-start ${
                  isMaximized ? "text-[18px] py-3" : "text-[16px]"
                }`}
              >
                <div className="flex-1">
                  <div className="font-semibold text-[#800000]">
                    {getEventLabel(event)}
                  </div>
                  <div
                    className={`text-gray-600 mt-1 ${
                      isMaximized ? "text-[16px]" : "text-[14px]"
                    }`}
                  >
                    {getEventType(event)}
                  </div>
                </div>
                {isAdmin && event.id && onDeletePostedEvent && (
                  <button
                    onClick={() => onDeletePostedEvent(event.id!)}
                    className="text-red-500 hover:text-red-700 font-bold text-[20px] transition-colors ml-2"
                    title="Delete event"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            {/* Personal Events */}
            {personalEventsForDay.map((event, i) => (
              <div
                key={`personal-${i}`}
                className={`bg-[#F6B6B6] px-3 py-2 rounded-lg mb-2 flex justify-between items-start ${
                  isMaximized ? "text-[18px] py-3" : "text-[16px]"
                }`}
              >
                <div className="flex-1">
                  <div className="font-semibold text-[#800000]">
                    {getEventLabel(event)}
                  </div>
                  <div
                    className={`text-gray-600 mt-1 ${
                      isMaximized ? "text-[16px]" : "text-[14px]"
                    }`}
                  >
                    {getEventType(event)}
                  </div>
                </div>
                {setPersonalEvents && (
                  <button
                    onClick={() => handleDeletePersonalEvent(event)}
                    className="text-red-500 hover:text-red-700 font-bold text-[20px] transition-colors ml-2"
                    title="Delete event"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Custom reminders */}
        <div>
          <h3
            className={`font-bold text-[#800000] mb-2 ${
              isMaximized ? "text-[18px]" : "text-[13px]"
            }`}
          >
            Custom Reminders:
          </h3>
          {reminders.length === 0 ? (
            <div
              className={`text-gray-500 italic ${
                isMaximized ? "text-[16px]" : "text-[14px]"
              }`}
            >
              No custom reminders
            </div>
          ) : (
            reminders.map((r, i) => (
              <div
                key={i}
                className={`flex items-center justify-between bg-[#D9D9D9] px-3 py-2 rounded-full font-medium text-[#800000] mb-2 ${
                  isMaximized ? "text-[16px]" : "text-[14px]"
                }`}
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

      {/* Add input */}
      <div
        className="flex items-center justify-between bg-[#D9D9D9] rounded-full px-3 mt-3 flex-shrink-0"
        style={{
          width: "100%",
          height: isMaximized ? "44px" : "36px",
        }}
      >
        <input
          type="text"
          value={newReminder}
          onChange={(e) => setNewReminder(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddReminder()}
          placeholder={`Add reminder on ${formattedDate}`}
          className={`flex-1 text-gray-700 outline-none bg-transparent ${
            isMaximized ? "text-[16px]" : "text-[14px]"
          }`}
          suppressHydrationWarning
        />
        <button
          onClick={handleAddReminder}
          className="flex items-center justify-center rounded-full bg-gray-300 hover:bg-gray-400 transition"
          style={{
            width: isMaximized ? 36 : 32,
            height: isMaximized ? 36 : 32,
          }}
          suppressHydrationWarning
        >
          <Image
            src="/Bellplus.svg"
            alt="Add Reminder"
            width={isMaximized ? 20 : 18}
            height={isMaximized ? 20 : 18}
          />
        </button>
      </div>
    </div>
  );

  if (isMaximized) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={() => onMaximizeToggle(null)} // Minimize when clicking outside
      >
        <div onClick={(e) => e.stopPropagation()}>{panelContent}</div>
      </div>
    );
  }

  return panelContent;
}
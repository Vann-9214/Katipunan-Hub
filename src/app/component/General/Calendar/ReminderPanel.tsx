"use client";

import React from "react";
import Image from "next/image";
import { PT_Sans, Montserrat } from "next/font/google";
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

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
  isMaximized: boolean;
  onMaximizeToggle: (panel: PanelType | null) => void;
  currentMaximizedPanel: PanelType;
  onPanelSwitch: (panel: PanelType) => void;
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
  isMaximized,
  onMaximizeToggle,
  currentMaximizedPanel,
  onPanelSwitch,
}: ReminderPanelProps) {
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
  const formattedDate = `${displayDay} ${monthName}`; // Cleaned up formatting slightly

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
      className={`${ptSans.className} flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300`}
      style={
        isMaximized
          ? { width: "100%", height: "100%", maxHeight: "900px" }
          : { width: "100%", height: "650px" }
      }
    >
      {/* Header - Maroon Gradient */}
      <div className="bg-gradient-to-r from-[#8B0E0E] to-[#4e0505] p-5 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Image
              src="/Bellplus.svg"
              alt="Bell Icon"
              width={20}
              height={20}
              className="brightness-0 invert"
            />
          </div>
          <h2 className={`${montserrat.className} text-xl font-bold`}>
            Reminders
          </h2>
        </div>

        <div className="flex gap-2 items-center">
          {/* Maximize Toggle */}
          {isMaximized && (
            <PanelToggleSwitch
              currentPanel={currentMaximizedPanel}
              onPanelChange={onPanelSwitch}
            />
          )}

          <button
            onClick={handleToggleMaximize}
            className="flex items-center justify-center rounded-full hover:bg-white/10 w-10 h-10 transition text-white"
            title={isMaximized ? "Minimize" : "Maximize"}
          >
            <span className="text-[20px] font-bold pb-1">
              {isMaximized ? "−" : "⛶"}
            </span>
          </button>
        </div>
      </div>

      {/* Subheader: Date & Count */}
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
        <span
          className={`${montserrat.className} text-gray-700 font-bold text-lg`}
        >
          {formattedDate}
        </span>
        <span className="bg-[#8B0E0E]/10 text-[#8B0E0E] px-3 py-1 rounded-full text-xs font-bold">
          {totalEvents} {totalEvents === 1 ? "event" : "events"}
        </span>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {totalEvents > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
              Events on this day
            </h3>

            {/* Holidays */}
            {holidaysForDay.map((event, i) => (
              <div
                key={`holiday-${i}`}
                className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex justify-between items-start hover:shadow-sm transition-shadow"
              >
                <div className="flex-1">
                  <div className="font-bold text-amber-800 text-sm">
                    {getEventLabel(event)}
                  </div>
                  <div className="text-amber-600 text-xs mt-1">
                    {getEventType(event)}
                  </div>
                </div>
              </div>
            ))}

            {/* Posted Events */}
            {postedEventsForDay.map((event, i) => (
              <div
                key={`posted-${i}`}
                className="bg-red-50 border border-red-100 p-3 rounded-xl flex justify-between items-start hover:shadow-sm transition-shadow"
              >
                <div className="flex-1">
                  <div className="font-bold text-[#8B0E0E] text-sm">
                    {getEventLabel(event)}
                  </div>
                  <div className="text-red-600 text-xs mt-1">
                    {getEventType(event)}
                  </div>
                </div>
                {isAdmin && event.id && onDeletePostedEvent && (
                  <button
                    onClick={() => onDeletePostedEvent(event.id!)}
                    className="text-red-400 hover:text-red-600 font-bold text-lg ml-2"
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
                className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex justify-between items-start hover:shadow-sm transition-shadow"
              >
                <div className="flex-1">
                  <div className="font-bold text-gray-800 text-sm">
                    {getEventLabel(event)}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    {getEventType(event)}
                  </div>
                </div>
                {setPersonalEvents && (
                  <button
                    onClick={() => handleDeletePersonalEvent(event)}
                    className="text-gray-400 hover:text-red-500 font-bold text-lg ml-2"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reminders List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
            Custom Reminders
          </h3>
          {reminders.length === 0 ? (
            <div className="text-gray-400 italic text-sm ml-1">
              No custom reminders
            </div>
          ) : (
            reminders.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <span className="text-gray-700 font-medium text-sm truncate">
                  {r}
                </span>
                <button
                  onClick={() => handleDeleteReminder(i)}
                  className="text-gray-400 hover:text-red-500 font-bold ml-2"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 bg-white shrink-0">
        <div className="flex items-center bg-gray-100 rounded-xl p-2 pl-4 transition-all focus-within:ring-2 focus-within:ring-[#8B0E0E]/20">
          <input
            type="text"
            value={newReminder}
            onChange={(e) => setNewReminder(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddReminder()}
            placeholder={`Add task for ${formattedDate}...`}
            className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-700 placeholder:text-gray-400"
          />
          <button
            onClick={handleAddReminder}
            className="p-2 bg-white rounded-lg shadow-sm text-[#8B0E0E] hover:scale-105 transition-transform"
          >
            <Image src="/Bellplus.svg" alt="Add" width={16} height={16} />
          </button>
        </div>
      </div>
    </div>
  );

  if (isMaximized) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-8"
        onClick={() => onMaximizeToggle(null)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl h-full"
        >
          {panelContent}
        </div>
      </div>
    );
  }

  return panelContent;
}

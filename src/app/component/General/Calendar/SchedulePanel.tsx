"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PT_Sans, Montserrat } from "next/font/google";
import {
  Holiday,
  PersonalEvent,
  PostedEvent,
  FilterType,
} from "@/app/component/General/Calendar/types";
import ScheduleFilterSwitch from "@/app/component/General/Calendar/ScheduleFilterSwitch";
import ScheduleEventsList from "@/app/component/General/Calendar/ScheduleEventsList";
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

interface SchedulePanelProps {
  holidaysForCurrentMonth: Holiday[];
  personalEvents: PersonalEvent[];
  setPersonalEvents: React.Dispatch<React.SetStateAction<PersonalEvent[]>>;
  postedEvents: PostedEvent[];
  year: number;
  currentMonth: number;
  selectedDay: number | null;
  todayDate: number;
  monthName: string;
  isAdmin: boolean;
  onDeletePostedEvent?: (eventId: string) => void;
  isMaximized: boolean;
  onMaximizeToggle: (panel: PanelType | null) => void;
  currentMaximizedPanel: PanelType;
  onPanelSwitch: (panel: PanelType) => void;
}

export default function SchedulePanel({
  holidaysForCurrentMonth,
  personalEvents,
  setPersonalEvents,
  postedEvents,
  year,
  currentMonth,
  selectedDay,
  todayDate,
  monthName,
  isAdmin,
  onDeletePostedEvent,
  isMaximized,
  onMaximizeToggle,
  currentMaximizedPanel,
  onPanelSwitch,
}: SchedulePanelProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("Global");
  const [newEvent, setNewEvent] = useState("");

  const handleToggleMaximize = () => {
    onMaximizeToggle(isMaximized ? null : "Schedule");
  };

  const handleAddEvent = () => {
    if (newEvent.trim() !== "") {
      const dayToAdd = selectedDay || todayDate;
      setPersonalEvents((prev) => [
        ...prev,
        {
          name: newEvent.trim(),
          year,
          month: currentMonth + 1,
          day: dayToAdd,
        },
      ]);
      setNewEvent("");
    }
  };

  // Keep delete event logic for lists
  const handleDeleteEvent = (index: number) => {
    setPersonalEvents((prev) => prev.filter((_, i) => i !== index));
  };

  // Keep prompt logic just in case, though we have an input
  const handlePromptAddEvent = () => {
    const ev = prompt("Enter new event:");
    if (ev && ev.trim()) {
      const dayToAdd = selectedDay || todayDate;
      setPersonalEvents((prev) => [
        ...prev,
        {
          name: ev.trim(),
          year,
          month: currentMonth + 1,
          day: dayToAdd,
        },
      ]);
    }
  };

  const filteredPersonalEvents = personalEvents.filter(
    (e) => e.year === year && e.month === currentMonth + 1
  );
  const filteredPostedEvents = postedEvents.filter(
    (e) => e.year === year && e.month === currentMonth + 1
  );
  const globalPostedEvents = filteredPostedEvents.filter(
    (e) => e.audience === "Global"
  );
  const coursePostedEvents = filteredPostedEvents.filter(
    (e) => e.audience === "Course"
  );

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
              src="/Schedule.svg"
              alt="Schedule Icon"
              width={20}
              height={20}
              className="brightness-0 invert"
            />
          </div>
          <h2 className={`${montserrat.className} text-xl font-bold`}>
            Schedule
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

          {/* Plus Button in Header (Optional alias to prompt) */}
          <button
            onClick={handlePromptAddEvent}
            className="flex items-center justify-center rounded-full hover:bg-white/10 w-10 h-10 transition text-white"
          >
            <Image
              src="/Bellplus.svg"
              alt="Add"
              width={20}
              height={20}
              className="brightness-0 invert"
            />
          </button>
        </div>
      </div>

      {/* Filter Switch */}
      <div className="p-4 bg-gray-50 border-b border-gray-100 shrink-0">
        <ScheduleFilterSwitch
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-2">
        <ScheduleEventsList
          selectedFilter={selectedFilter}
          holidaysForCurrentMonth={holidaysForCurrentMonth}
          globalPostedEvents={globalPostedEvents}
          coursePostedEvents={coursePostedEvents}
          filteredPersonalEvents={filteredPersonalEvents}
          personalEvents={personalEvents}
          year={year}
          onDeleteEvent={handleDeleteEvent}
          isAdmin={isAdmin}
          onDeletePostedEvent={onDeletePostedEvent}
        />
      </div>

      {/* Quick Add Row */}
      {(selectedFilter === "Personal" || selectedFilter === "All") && (
        <div className="p-4 border-t border-gray-100 bg-white shrink-0">
          <div className="flex items-center bg-gray-100 rounded-xl p-2 pl-4 transition-all focus-within:ring-2 focus-within:ring-[#8B0E0E]/20">
            <input
              type="text"
              value={newEvent}
              onChange={(e) => setNewEvent(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddEvent()}
              placeholder={`Add event on ${
                selectedDay || todayDate
              } ${monthName.slice(0, 3)}...`}
              className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-700 placeholder:text-gray-400"
            />
            <button
              onClick={handleAddEvent}
              className="p-2 bg-white rounded-lg shadow-sm text-[#8B0E0E] hover:scale-105 transition-transform"
            >
              <Image src="/Bellplus.svg" alt="Add" width={16} height={16} />
            </button>
          </div>
        </div>
      )}
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

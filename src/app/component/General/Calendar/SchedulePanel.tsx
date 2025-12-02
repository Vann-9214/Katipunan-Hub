// SchedulePanel.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PT_Sans } from "next/font/google";
import { Holiday, PersonalEvent, PostedEvent, FilterType } from "@/app/component/General/Calendar/types";
import ScheduleFilterSwitch from "@/app/component/General/Calendar/ScheduleFilterSwitch";
import ScheduleEventsList from "@/app/component/General/Calendar/ScheduleEventsList";
import PanelToggleSwitch from "./PanelToggleSwitch";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
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
  // State control from parent
  isMaximized: boolean; // Use prop to control maximized state
  onMaximizeToggle: (panel: PanelType | null) => void; // Function to notify parent of minimize/maximize
  currentMaximizedPanel: PanelType; // Only needed if maximized, but included for completeness
  onPanelSwitch: (panel: PanelType) => void; // Function to switch panels when maximized
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
  isMaximized, // Now controlled by prop
  onMaximizeToggle, // Function from parent
  currentMaximizedPanel,
  onPanelSwitch,
}: SchedulePanelProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("Global");
  const [newEvent, setNewEvent] = useState("");

  // Simplified maximize handler that communicates with the parent
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

  const handleDeleteEvent = (index: number) => {
    setPersonalEvents((prev) => prev.filter((_, i) => i !== index));
  };

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
          Schedule
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
            onClick={handlePromptAddEvent}
          >
            <Image src="/Bellplus.svg" alt="Add Event" width={30} height={30} />
          </div>
        </div>
      </div>

      {/* Filter Switch */}
      <div className="mb-4">
        <ScheduleFilterSwitch
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-hidden">
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

      {/* Add event row */}
      {(selectedFilter === "Personal" || selectedFilter === "All") && (
        <div
          className="mt-4 flex items-center justify-between w-full bg-gray-100 rounded-full px-4 text-gray-600 shadow-sm"
          style={{ height: isMaximized ? "44px" : "36px" }}
        >
          <input
            type="text"
            placeholder={`Add event on ${
              selectedDay
                ? `${selectedDay} ${monthName.slice(0, 3)}`
                : `${todayDate} ${monthName.slice(0, 3)}`
            }`}
            value={newEvent}
            onChange={(e) => setNewEvent(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddEvent()}
            className={`bg-transparent outline-none w-full text-gray-700 ${
              isMaximized ? "text-[16px]" : "text-[14px]"
            }`}
          />
          <button
            onClick={handleAddEvent}
            className="p-1 hover:opacity-80 transition"
          >
            <Image
              src="/Bellplus.svg"
              alt="Add"
              width={isMaximized ? 20 : 18}
              height={isMaximized ? 20 : 18}
            />
          </button>
        </div>
      )}
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
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PT_Sans, Montserrat } from "next/font/google";
import { Holiday, PersonalEvent, PostedEvent, FilterType } from "@/app/component/General/Calendar/types";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600"],
});

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
}: SchedulePanelProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("Global Events");
  const [newEvent, setNewEvent] = useState("");

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

  // Filter posted events for current month
  const filteredPostedEvents = postedEvents.filter(
    (e) => e.year === year && e.month === currentMonth + 1
  );

  // Separate by audience
  const globalPostedEvents = filteredPostedEvents.filter(
    (e) => e.audience === "Global"
  );
  const coursePostedEvents = filteredPostedEvents.filter(
    (e) => e.audience === "Course"
  );

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
        <h2 className="text-[18px] font-bold text-[#800000]">Schedule</h2>
        <div
          className="flex items-center justify-center rounded-full bg-[#800000] cursor-pointer hover:bg-[#A52A2A] transition"
          style={{ width: "43px", height: "40px" }}
          onClick={handlePromptAddEvent}
        >
          <Image src="/Bellplus.svg" alt="Add Event" width={30} height={30} />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-evenly mb-4">
        {(["Global Events", "Personal Events", "All"] as const).map(
          (tab: FilterType) => (
            <button
              key={tab}
              onClick={() => setSelectedFilter(tab)}
              className={`${montserrat.className} text-[13px] font-medium px-3 py-1 rounded-full relative`}
              style={{
                color: selectedFilter === tab ? "#000" : "#666",
                backgroundColor: selectedFilter === tab ? "#FFD700" : "#D9D9D9",
                transition: "all 0.2s ease",
              }}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {/* Global Events */}
        {selectedFilter === "Global Events" && (
          <>
            {/* Holidays */}
            {holidaysForCurrentMonth.length > 0 && (
              <div className="mb-4">
                <h3 className="text-[12px] font-bold text-[#800000] mb-2 uppercase">
                  Holidays
                </h3>
                {holidaysForCurrentMonth.map((h, idx) => (
                  <div
                    key={`holiday-${idx}`}
                    className="flex items-center gap-3 bg-[#FFE5B4] px-3 py-2 rounded-lg text-[14px] font-medium text-[#800000] mb-2"
                  >
                    <Image
                      src="/Calendar.svg"
                      alt="Calendar"
                      width={20}
                      height={20}
                    />
                    <span>
                      {h.day}{" "}
                      {new Date(year, h.month - 1).toLocaleString("en-US", {
                        month: "short",
                      })}
                      : {h.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Global Posted Events */}
            {globalPostedEvents.length > 0 && (
              <div className="mb-4">
                <h3 className="text-[12px] font-bold text-[#800000] mb-2 uppercase">
                  Global Events
                </h3>
                {globalPostedEvents.map((e, idx) => (
                  <div
                    key={`global-${idx}`}
                    className="flex items-center gap-3 bg-[#C4E1A4] px-3 py-2 rounded-lg text-[14px] font-medium text-[#800000] mb-2"
                  >
                    <Image
                      src="/Calendar.svg"
                      alt="Calendar"
                      width={20}
                      height={20}
                    />
                    <span className="flex-1">
                      {e.day}{" "}
                      {new Date(e.year, e.month - 1).toLocaleString("en-US", {
                        month: "short",
                      })}
                      : {e.title}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Course Posted Events */}
            {coursePostedEvents.length > 0 && (
              <div className="mb-4">
                <h3 className="text-[12px] font-bold text-[#800000] mb-2 uppercase">
                  Course Events
                </h3>
                {coursePostedEvents.map((e, idx) => (
                  <div
                    key={`course-${idx}`}
                    className="bg-[#A0D8EF] px-3 py-2 rounded-lg text-[14px] font-medium text-[#800000] mb-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Image
                        src="/Calendar.svg"
                        alt="Calendar"
                        width={20}
                        height={20}
                      />
                      <span>
                        {e.day}{" "}
                        {new Date(e.year, e.month - 1).toLocaleString("en-US", {
                          month: "short",
                        })}
                        : {e.title}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-700 ml-6">
                      Course: {e.course}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {holidaysForCurrentMonth.length === 0 &&
              globalPostedEvents.length === 0 &&
              coursePostedEvents.length === 0 && (
                <div className="text-[14px] text-gray-500 italic">
                  No global events this month.
                </div>
              )}
          </>
        )}

        {/* Personal Events */}
        {selectedFilter === "Personal Events" &&
          (filteredPersonalEvents.length === 0 ? (
            <div className="text-[14px] text-gray-500 italic">
              No personal events added yet.
            </div>
          ) : (
            filteredPersonalEvents.map((e, i) => (
              <div
                key={`p-${i}`}
                className="flex items-center gap-3 bg-[#F6B6B6] px-3 py-2 rounded-lg text-[14px] font-medium text-[#800000] mb-2"
              >
                <Image
                  src="/Calendar.svg"
                  alt="Calendar"
                  width={20}
                  height={20}
                />
                <span className="flex-1">
                  {e.day}{" "}
                  {new Date(e.year, e.month - 1).toLocaleString("en-US", {
                    month: "short",
                  })}
                  : {e.name}
                </span>
                <button
                  onClick={() => handleDeleteEvent(i)}
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  ×
                </button>
              </div>
            ))
          ))}

        {/* All Events */}
        {selectedFilter === "All" && (
          <>
            {/* Holidays */}
            {holidaysForCurrentMonth.length > 0 && (
              <div className="mb-4">
                <h3 className="text-[12px] font-bold text-[#800000] mb-2 uppercase">
                  Holidays
                </h3>
                {holidaysForCurrentMonth.map((h, idx) => (
                  <div
                    key={`all-holiday-${idx}`}
                    className="flex items-center gap-3 bg-[#FFE5B4] px-3 py-2 rounded-lg text-[14px] font-medium text-[#800000] mb-2"
                  >
                    <Image
                      src="/Calendar.svg"
                      alt="Calendar"
                      width={20}
                      height={20}
                    />
                    <span>
                      {h.day}{" "}
                      {new Date(year, h.month - 1).toLocaleString("en-US", {
                        month: "short",
                      })}
                      : {h.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Global Posted Events */}
            {globalPostedEvents.length > 0 && (
              <div className="mb-4">
                <h3 className="text-[12px] font-bold text-[#800000] mb-2 uppercase">
                  Global Events
                </h3>
                {globalPostedEvents.map((e, idx) => (
                  <div
                    key={`all-global-${idx}`}
                    className="flex items-center gap-3 bg-[#C4E1A4] px-3 py-2 rounded-lg text-[14px] font-medium text-[#800000] mb-2"
                  >
                    <Image
                      src="/Calendar.svg"
                      alt="Calendar"
                      width={20}
                      height={20}
                    />
                    <span>
                      {e.day}{" "}
                      {new Date(e.year, e.month - 1).toLocaleString("en-US", {
                        month: "short",
                      })}
                      : {e.title}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Course Posted Events */}
            {coursePostedEvents.length > 0 && (
              <div className="mb-4">
                <h3 className="text-[12px] font-bold text-[#800000] mb-2 uppercase">
                  Course Events
                </h3>
                {coursePostedEvents.map((e, idx) => (
                  <div
                    key={`all-course-${idx}`}
                    className="bg-[#A0D8EF] px-3 py-2 rounded-lg text-[14px] font-medium text-[#800000] mb-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Image
                        src="/Calendar.svg"
                        alt="Calendar"
                        width={20}
                        height={20}
                      />
                      <span>
                        {e.day}{" "}
                        {new Date(e.year, e.month - 1).toLocaleString("en-US", {
                          month: "short",
                        })}
                        : {e.title}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-700 ml-6">
                      Course: {e.course}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Personal Events */}
            {filteredPersonalEvents.length > 0 && (
              <div className="mb-4">
                <h3 className="text-[12px] font-bold text-[#800000] mb-2 uppercase">
                  Personal Events
                </h3>
                {filteredPersonalEvents.map((e, i) => (
                  <div
                    key={`all-p-${i}`}
                    className="flex items-center gap-3 bg-[#F6B6B6] px-3 py-2 rounded-lg text-[14px] font-medium text-[#800000] mb-2"
                  >
                    <Image
                      src="/Calendar.svg"
                      alt="Calendar"
                      width={20}
                      height={20}
                    />
                    <span className="flex-1">
                      {e.day}{" "}
                      {new Date(e.year, e.month - 1).toLocaleString("en-US", {
                        month: "short",
                      })}
                      : {e.name}
                    </span>
                    <button
                      onClick={() => {
                        const allEventsIndex = personalEvents.findIndex(
                          (pe) =>
                            pe.name === e.name &&
                            pe.year === e.year &&
                            pe.month === e.month &&
                            pe.day === e.day
                        );
                        if (allEventsIndex !== -1) {
                          handleDeleteEvent(allEventsIndex);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add event row (only for Personal Events and All) */}
      {(selectedFilter === "Personal Events" || selectedFilter === "All") && (
        <div className="mt-4 flex items-center justify-between w-full bg-gray-100 rounded-full px-4 py-2 text-gray-600 shadow-sm">
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
            className="bg-transparent outline-none w-full text-[14px] text-gray-700"
          />

          <button
            onClick={handleAddEvent}
            className="p-1 hover:opacity-80 transition"
          >
            <Image src="/Bellplus.svg" alt="Add" width={18} height={18} />
          </button>
        </div>
      )}
    </div>
  );
}
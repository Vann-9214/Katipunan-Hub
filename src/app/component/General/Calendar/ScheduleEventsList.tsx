"use client";

import React from "react";
import Image from "next/image";
import { Holiday, PersonalEvent, PostedEvent, FilterType } from "@/app/component/General/Calendar/types";

interface ScheduleEventsListProps {
  selectedFilter: FilterType;
  holidaysForCurrentMonth: Holiday[];
  globalPostedEvents: PostedEvent[];
  coursePostedEvents: PostedEvent[];
  filteredPersonalEvents: PersonalEvent[];
  personalEvents: PersonalEvent[];
  year: number;
  onDeleteEvent: (index: number) => void;
  isAdmin: boolean;
  onDeletePostedEvent?: (eventId: string) => void;
}

export default function ScheduleEventsList({
  selectedFilter,
  holidaysForCurrentMonth,
  globalPostedEvents,
  coursePostedEvents,
  filteredPersonalEvents,
  personalEvents,
  year,
  onDeleteEvent,
  isAdmin,
  onDeletePostedEvent,
}: ScheduleEventsListProps) {
  return (
    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
      {/* Global Events */}
      {selectedFilter === "Global" && (
        <>
          {/* Holidays */}
          {holidaysForCurrentMonth.length > 0 && (
            <div className="mb-4">
              <h3 className="text-[18px] font-bold text-[#800000] mb-2 uppercase">
                Holidays
              </h3>
              {holidaysForCurrentMonth.map((h, idx) => (
                <div
                  key={`holiday-${idx}`}
                  className="flex items-center gap-3 bg-[#FFE5B4] px-3 py-2 rounded-lg text-[15px] font-medium text-[#800000] mb-2"
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
              <h3 className="text-[18px] font-bold text-[#800000] mb-2 uppercase">
                Global Events
              </h3>
              {globalPostedEvents.map((e, idx) => (
                <div
                  key={`global-${idx}`}
                  className="flex items-center gap-3 bg-[#C4E1A4] px-3 py-2 rounded-lg text-[15px] font-medium text-[#800000] mb-2"
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
                  {/* Delete button - only visible for admins */}
                  {isAdmin && e.id && onDeletePostedEvent && (
                    <button
                      onClick={() => onDeletePostedEvent(e.id!)}
                      className="text-red-500 hover:text-red-700 font-bold text-[20px] transition-colors"
                      title="Delete event"
                    >
                      ×
                    </button>
                  )}
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
                    <span className="flex-1">
                      {e.day}{" "}
                      {new Date(e.year, e.month - 1).toLocaleString("en-US", {
                        month: "short",
                      })}
                      : {e.title}
                    </span>
                    {/* Delete button for course events - only visible for admins */}
                    {isAdmin && e.id && onDeletePostedEvent && (
                      <button
                        onClick={() => onDeletePostedEvent(e.id!)}
                        className="text-red-500 hover:text-red-700 font-bold text-[20px] transition-colors"
                        title="Delete event"
                      >
                        ×
                      </button>
                    )}
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
      {selectedFilter === "Personal" &&
        (filteredPersonalEvents.length === 0 ? (
          <div className="text-[18px] text-gray-500 italic">
            No personal events added yet.
          </div>
        ) : (
          filteredPersonalEvents.map((e, i) => (
            <div
              key={`p-${i}`}
              className="flex items-center gap-3 bg-[#F6B6B6] px-3 py-2 rounded-lg text-[15px] font-medium text-[#800000] mb-2"
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
                onClick={() => onDeleteEvent(i)}
                className="text-red-500 hover:text-red-700 font-bold text-[20px]"
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
              <h3 className="text-[18px] font-bold text-[#800000] mb-2 uppercase">
                Holidays
              </h3>
              {holidaysForCurrentMonth.map((h, idx) => (
                <div
                  key={`all-holiday-${idx}`}
                  className="flex items-center gap-3 bg-[#FFE5B4] px-3 py-2 rounded-lg text-[15px] font-medium text-[#800000] mb-2"
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
              <h3 className="text-[18px] font-bold text-[#800000] mb-2 uppercase">
                Global Events
              </h3>
              {globalPostedEvents.map((e, idx) => (
                <div
                  key={`all-global-${idx}`}
                  className="flex items-center gap-3 bg-[#C4E1A4] px-3 py-2 rounded-lg text-[15px] font-medium text-[#800000] mb-2"
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
                  {/* Delete button - only visible for admins */}
                  {isAdmin && e.id && onDeletePostedEvent && (
                    <button
                      onClick={() => onDeletePostedEvent(e.id!)}
                      className="text-red-500 hover:text-red-700 font-bold text-[20px] transition-colors"
                      title="Delete event"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Course Posted Events */}
          {coursePostedEvents.length > 0 && (
            <div className="mb-4">
              <h3 className="text-[18px] font-bold text-[#800000] mb-2 uppercase">
                Course Events
              </h3>
              {coursePostedEvents.map((e, idx) => (
                <div
                  key={`all-course-${idx}`}
                  className="bg-[#A0D8EF] px-3 py-2 rounded-lg text-[15px] font-medium text-[#800000] mb-2"
                >
                  <div className="flex items-center gap-2 mb-1">
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
                    {/* Delete button for course events - only visible for admins */}
                    {isAdmin && e.id && onDeletePostedEvent && (
                      <button
                        onClick={() => onDeletePostedEvent(e.id!)}
                        className="text-red-500 hover:text-red-700 font-bold text-[20px] transition-colors"
                        title="Delete event"
                      >
                        ×
                      </button>
                    )}
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
              <h3 className="text-[18px] font-bold text-[#800000] mb-2 uppercase">
                Personal Events
              </h3>
              {filteredPersonalEvents.map((e, i) => (
                <div
                  key={`all-p-${i}`}
                  className="flex items-center gap-3 bg-[#F6B6B6] px-3 py-2 rounded-lg text-[15px] font-medium text-[#800000] mb-2"
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
                        onDeleteEvent(allEventsIndex);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 font-bold text-[20px]"
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
  );
}
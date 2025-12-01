"use client";

import React from "react";
import { Montserrat } from "next/font/google";
import { X } from "lucide-react";
import {
  Holiday,
  PostedEvent,
  PersonalEvent,
} from "@/app/component/General/Calendar/types";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600"],
});

interface EventDetailsModalProps {
  event: Holiday | PostedEvent | PersonalEvent | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
}

export default function EventDetailsModal({
  event,
  position,
  onClose,
}: EventDetailsModalProps) {
  if (!event || !position) return null;

  // Determine event type and details
  const isHoliday = "name" in event && !("title" in event);
  const isPostedEvent = "title" in event && "audience" in event;

  const eventTitle = isHoliday
    ? (event as Holiday).name
    : "title" in event
    ? (event as PostedEvent).title
    : (event as PersonalEvent).name;

  // Get year - holidays don't have year property, use current year
  const eventYear = "year" in event && event.year ? event.year : new Date().getFullYear();
  const eventDate = `${event.month}/${event.day}/${eventYear}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={onClose}
      />

      {/* Small Popup Card */}
      <div
        className="fixed z-[9999] bg-white rounded-xl shadow-2xl p-4 border-2 border-[#800000]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: "280px",
          fontFamily: montserrat.style.fontFamily,
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Event Type Badge */}
        <div className="mb-2">
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
              isHoliday
                ? "bg-red-100 text-red-700"
                : isPostedEvent
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {isHoliday ? "Holiday" : isPostedEvent ? "Event" : "Personal"}
          </span>
        </div>

        {/* Event Title */}
        <h3 className="text-base font-bold text-[#800000] mb-2 pr-6">
          {eventTitle}
        </h3>

        {/* Event Date */}
        <p className="text-sm text-gray-600 mb-2">{eventDate}</p>

        {/* Additional Details for Posted Events */}
        {isPostedEvent && (event as PostedEvent).course && (
          <p className="text-xs text-gray-500 border-t pt-2">
            {(event as PostedEvent).course}
          </p>
        )}
      </div>
    </>
  );
}
"use client";

import React, { useState } from "react";
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
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent closing when clicking inside the card
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop - only show when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998]"
          onClick={onClose}
        />
      )}

      {/* Popup Card - Changes size based on expanded state */}
      <div
        className={`fixed z-[9999] bg-white rounded-xl shadow-2xl border-2 border-[#800000] cursor-pointer transition-all duration-300 ${
          isExpanded ? "p-6" : "p-4"
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isExpanded ? "400px" : "280px",
          fontFamily: montserrat.style.fontFamily,
        }}
        onClick={handleCardClick}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={isExpanded ? 22 : 18} />
        </button>

        {/* Event Type Badge */}
        <div className="mb-2">
          <span
            className={`inline-block px-2 py-1 rounded-full font-semibold transition-all ${
              isExpanded ? "text-sm" : "text-xs"
            } ${
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
        <h3
          className={`font-bold text-[#800000] mb-2 pr-6 transition-all ${
            isExpanded ? "text-xl" : "text-base"
          }`}
        >
          {eventTitle}
        </h3>

        {/* Event Date */}
        <p
          className={`text-gray-600 mb-2 transition-all ${
            isExpanded ? "text-base" : "text-sm"
          }`}
        >
          📅 {eventDate}
        </p>

        {/* Additional Details - Always show when expanded */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-gray-200 space-y-2 animate-fadeIn">
            {isPostedEvent && (event as PostedEvent).course && (
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Course:</span>{" "}
                {(event as PostedEvent).course}
              </div>
            )}
            {isPostedEvent && (event as PostedEvent).audience && (
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Audience:</span>{" "}
                {(event as PostedEvent).audience}
              </div>
            )}
            <div className="text-xs text-gray-500 italic mt-3">
              Click again to minimize
            </div>
          </div>
        )}

        {/* Hint text when not expanded */}
        {!isExpanded && (
          <p className="text-xs text-gray-400 italic mt-2">
            Click to see more details
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
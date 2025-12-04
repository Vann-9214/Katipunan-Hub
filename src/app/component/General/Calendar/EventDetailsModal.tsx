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
  weight: ["400", "600", "700"],
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

  const eventYear =
    "year" in event && event.year ? event.year : new Date().getFullYear();
  const eventDate = `${event.month}/${event.day}/${eventYear}`;

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
    onClose();
  };

  // Theme colors based on type
  const accentColor = isHoliday
    ? "bg-amber-400"
    : isPostedEvent
    ? "bg-[#8B0E0E]"
    : "bg-gray-400";

  const badgeStyle = isHoliday
    ? "bg-amber-100 text-amber-700"
    : isPostedEvent
    ? "bg-red-100 text-[#8B0E0E]"
    : "bg-gray-100 text-gray-700";

  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/20 z-[9998]" onClick={onClose} />
      )}

      {/* Popup Card */}
      <div
        className={`fixed z-[9999] bg-white rounded-2xl shadow-xl ring-1 ring-black/5 cursor-pointer transition-all duration-300 origin-top-left overflow-hidden ${montserrat.className}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isExpanded ? "340px" : "260px",
          transform: isExpanded ? "scale(1.02)" : "scale(1)",
        }}
        onClick={handleCardClick}
      >
        {/* Color Accent Bar */}
        <div className={`h-2 w-full ${accentColor}`} />

        <div className="p-4">
          {/* Header Row */}
          <div className="flex justify-between items-start mb-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${badgeStyle}`}
            >
              {isHoliday ? "Holiday" : isPostedEvent ? "Event" : "Personal"}
            </span>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Title */}
          <h3
            className={`font-bold text-gray-900 leading-tight mb-1 ${
              isExpanded ? "text-lg" : "text-base"
            }`}
          >
            {eventTitle}
          </h3>

          {/* Date */}
          <p className="text-sm text-gray-500 mb-2">📅 {eventDate}</p>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 animate-in slide-in-from-top-1 fade-in duration-200">
              {isPostedEvent && (event as PostedEvent).course && (
                <div className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">Course:</span>{" "}
                  {(event as PostedEvent).course}
                </div>
              )}
              {isPostedEvent && (event as PostedEvent).audience && (
                <div className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">Audience:</span>{" "}
                  {(event as PostedEvent).audience}
                </div>
              )}
              <div className="text-[10px] text-gray-400 italic mt-3 text-right">
                Click to minimize
              </div>
            </div>
          )}

          {!isExpanded && (
            <p className="text-[10px] text-gray-400 italic mt-2">
              Click for details
            </p>
          )}
        </div>
      </div>
    </>
  );
}

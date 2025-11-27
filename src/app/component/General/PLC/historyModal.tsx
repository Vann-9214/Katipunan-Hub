"use client";

import React, { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  AlertCircle,
  Trash2,
  Star,
  History,
} from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import { Booking } from "../../../../../supabase/Lib/PLC/usePLCBooking";
import RateTutorModal from "./rateTutorModal";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  isTutor: boolean;
  onDelete?: (id: string) => void;
  onRateTutor?: (
    bookingId: string,
    tutorId: string,
    rating: number,
    review: string
  ) => Promise<void>;
}

export default function HistoryModal({
  isOpen,
  onClose,
  bookings,
  isTutor,
  onDelete,
  onRateTutor,
}: HistoryModalProps) {
  const [selectedBookingForRate, setSelectedBookingForRate] =
    useState<Booking | null>(null);

  if (!isOpen) return null;

  const formatTimeDisplay = (startStr: string, endStr?: string) => {
    const format = (t: string) => {
      const [h, m] = t.split(":");
      const date = new Date();
      date.setHours(parseInt(h), parseInt(m));
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };
    return endStr
      ? `${format(startStr)} - ${format(endStr)}`
      : format(startStr);
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        {/* Outer Gold Gradient Container */}
        <div className="relative w-full max-w-[800px] h-[80vh] p-[3px] rounded-[25px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-2xl animate-in fade-in zoom-in duration-300">
          {/* Inner White Content */}
          <div className="bg-white w-full h-full rounded-[22px] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#8B0E0E]/10 rounded-full">
                  <History size={24} className="text-[#8B0E0E]" />
                </div>
                <h2
                  className={`${montserrat.className} text-[24px] font-bold text-[#8B0E0E] tracking-tight`}
                >
                  Session History
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-[#8B0E0E]"
              >
                <X size={24} />
              </button>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-white custom-scrollbar">
              {bookings.length > 0 ? (
                bookings.map((booking) => {
                  const isRejected = booking.status === "Rejected";

                  // Dynamic Styles based on Status
                  const statusLabel = isRejected ? "Rejected" : "Completed";
                  const cardBorderColor = isRejected
                    ? "border-l-red-500"
                    : "border-l-green-500";
                  const cardBg = isRejected
                    ? "bg-red-50/30 hover:bg-red-50/50"
                    : "bg-white hover:bg-gray-50";
                  const badgeStyle = isRejected
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-700";

                  const otherPartyLabel = isTutor ? "Student" : "Tutor";
                  let otherPartyName = "Unknown";
                  if (isTutor) {
                    otherPartyName =
                      booking.Accounts?.fullName || "Unknown Student";
                  } else {
                    otherPartyName = isRejected
                      ? "N/A"
                      : booking.Tutor?.fullName || "Assigned Tutor";
                  }

                  // Rating Logic
                  const hasRated =
                    booking.TutorRatings && booking.TutorRatings.length > 0;
                  const ratingValue = hasRated
                    ? booking.TutorRatings![0].rating
                    : 0;

                  return (
                    <div
                      key={booking.id}
                      className={`relative w-full p-5 rounded-r-xl rounded-l-[4px] border border-gray-200 border-l-4 ${cardBorderColor} ${cardBg} shadow-sm transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group`}
                    >
                      {/* Left Side: Info */}
                      <div className="flex flex-col gap-2 min-w-0 flex-1">
                        <div className="flex items-start justify-between sm:justify-start gap-3">
                          <h3
                            className={`${montserrat.className} text-[18px] font-bold text-gray-900 truncate`}
                          >
                            {booking.subject}
                          </h3>
                          {/* Mobile Status Badge (Visible only on small screens if needed, currently hidden) */}
                        </div>

                        {/* Date & Time Row */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-500 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={15} className="text-[#EFBF04]" />
                            <span className={ptSans.className}>
                              {new Date(booking.bookingDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={15} className="text-[#EFBF04]" />
                            <span className={ptSans.className}>
                              {formatTimeDisplay(
                                booking.startTime,
                                booking.endTime
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Tutor/Student Name */}
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`${montserrat.className} text-xs font-bold text-gray-400 uppercase tracking-wide`}
                          >
                            {otherPartyLabel}
                          </span>
                          <span
                            className={`${ptSans.className} text-sm font-semibold text-gray-700`}
                          >
                            {otherPartyName}
                          </span>
                        </div>

                        {/* Show Rating Stars if Rated */}
                        {hasRated && !isRejected && !isTutor && (
                          <div className="flex items-center gap-1 mt-1 bg-yellow-50 w-fit px-2 py-1 rounded-md">
                            <span className="text-[10px] font-bold text-yellow-600 mr-1">
                              RATED:
                            </span>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={`${
                                  i < ratingValue
                                    ? "fill-[#EFBF04] text-[#EFBF04]"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right Side: Actions & Status */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto justify-between sm:justify-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${badgeStyle}`}
                        >
                          {statusLabel}
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Delete Button (Rejected Only) */}
                          {isRejected && onDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(booking.id);
                              }}
                              className="p-2 bg-white border border-red-200 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm group/del"
                              title="Delete Record"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}

                          {/* Rate Button (Completed & Not Rated) */}
                          {!isTutor && !isRejected && !hasRated && (
                            <button
                              onClick={() => setSelectedBookingForRate(booking)}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#EFBF04] to-[#F59E0B] rounded-lg text-white text-xs font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
                            >
                              <Star size={14} className="fill-white" /> Rate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                    <AlertCircle
                      size={40}
                      className="opacity-20 text-gray-500"
                    />
                  </div>
                  <p
                    className={`${montserrat.className} font-medium text-gray-500`}
                  >
                    No history records found.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end">
              <button
                onClick={onClose}
                className={`${montserrat.className} px-8 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl shadow-sm transition-all active:scale-95`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Modal Popup */}
      {selectedBookingForRate && (
        <RateTutorModal
          isOpen={!!selectedBookingForRate}
          onClose={() => setSelectedBookingForRate(null)}
          tutorName={selectedBookingForRate.Tutor?.fullName || "Tutor"}
          onSubmit={async (rating, review) => {
            if (onRateTutor && selectedBookingForRate.Tutor?.id) {
              await onRateTutor(
                selectedBookingForRate.id,
                selectedBookingForRate.Tutor.id,
                rating,
                review
              );
            }
          }}
        />
      )}
    </>
  );
}

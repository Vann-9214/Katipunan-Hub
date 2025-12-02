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
  User,
} from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import { Booking } from "../../../../../supabase/Lib/PLC/usePLCBooking";
import RateTutorModal from "./rateTutorModal";
// 1. Added Framer Motion for consistent animations
import { motion, AnimatePresence } from "framer-motion";

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
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            {/* --- Outer Gold Gradient Container --- */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="relative w-full max-w-[800px] h-[90vh] p-[2px] rounded-[24px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-2xl flex flex-col"
            >
              {/* --- Inner White Content --- */}
              <div className="bg-gray-50/50 w-full h-full rounded-[22px] flex flex-col overflow-hidden shadow-inner relative">
                {/* --- Header: Deep Red Gradient --- */}
                <div className="relative flex justify-between items-center px-6 py-5 bg-gradient-to-b from-[#4e0505] to-[#3a0000] border-b border-[#EFBF04]/30 shrink-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm">
                      <History size={20} className="text-[#EFBF04]" />
                    </div>
                    <div>
                      <h2
                        className={`${montserrat.className} text-[20px] font-bold text-white tracking-wide`}
                      >
                        Session History
                      </h2>
                      <p
                        className={`${ptSans.className} text-white/60 text-xs`}
                      >
                        Past appointments and records
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 cursor-pointer hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white active:scale-95"
                  >
                    <X size={24} />
                  </button>

                  {/* Decorative Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 blur-3xl rounded-full pointer-events-none" />
                </div>

                {/* --- List Content --- */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-3 bg-[#F9FAFB] custom-scrollbar">
                  {bookings.length > 0 ? (
                    bookings.map((booking, index) => {
                      const isRejected = booking.status === "Rejected";

                      // Styles
                      const statusColor = isRejected ? "#EF4444" : "#10B981"; // Red or Green
                      const statusLabel = isRejected ? "Rejected" : "Completed";

                      const otherPartyLabel = isTutor ? "Student" : "Tutor";
                      let otherPartyName = "Unknown";

                      if (isTutor) {
                        otherPartyName =
                          booking.Accounts?.fullName || "Unknown Student";
                      } else {
                        // FIX: Prioritize showing Tutor Name if available, regardless of status
                        if (booking.Tutor?.fullName) {
                          otherPartyName = booking.Tutor.fullName;
                        } else {
                          otherPartyName = isRejected
                            ? "N/A"
                            : "Assigned Tutor";
                        }
                      }

                      // Rating Logic
                      const hasRated =
                        booking.TutorRatings && booking.TutorRatings.length > 0;
                      const ratingValue = hasRated
                        ? booking.TutorRatings![0].rating
                        : 0;

                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          key={booking.id}
                          className={`relative w-full shrink-0 p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group bg-white overflow-hidden`}
                        >
                          {/* Status Strip on Left */}
                          <div
                            className="absolute left-0 top-0 bottom-0 w-[4px]"
                            style={{ backgroundColor: statusColor }}
                          />

                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pl-2">
                            {/* Left Side: Info */}
                            <div className="flex flex-col gap-2 min-w-0 flex-1">
                              {/* Subject & Status */}
                              <div className="flex items-center justify-between sm:justify-start gap-3">
                                <h3
                                  className={`${montserrat.className} text-[16px] font-bold text-[#1a1a1a] truncate`}
                                >
                                  {booking.subject}
                                </h3>
                                {/* Status Badge */}
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                    isRejected
                                      ? "bg-red-50 text-red-600 border-red-100"
                                      : "bg-green-50 text-green-700 border-green-100"
                                  }`}
                                >
                                  {statusLabel}
                                </span>
                              </div>

                              {/* Date & Time Row */}
                              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-gray-500 text-sm mt-1">
                                <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                  <Calendar
                                    size={13}
                                    className="text-[#8B0E0E]"
                                  />
                                  <span
                                    className={`${ptSans.className} font-medium`}
                                  >
                                    {new Date(
                                      booking.bookingDate
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                  <Clock size={13} className="text-[#8B0E0E]" />
                                  <span
                                    className={`${ptSans.className} font-medium`}
                                  >
                                    {formatTimeDisplay(
                                      booking.startTime,
                                      booking.endTime
                                    )}
                                  </span>
                                </div>
                              </div>

                              {/* Tutor/Student Name */}
                              <div className="flex items-center gap-2 mt-2">
                                <User size={14} className="text-gray-400" />
                                <span
                                  className={`${montserrat.className} text-xs font-bold text-gray-500 uppercase tracking-wide`}
                                >
                                  {otherPartyLabel}:
                                </span>
                                <span
                                  className={`${ptSans.className} text-sm font-semibold text-gray-800`}
                                >
                                  {otherPartyName}
                                </span>
                              </div>

                              {/* Show Rating Stars if Rated */}
                              {hasRated && !isRejected && !isTutor && (
                                <div className="flex items-center gap-1 mt-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={12}
                                      className={`${
                                        i < ratingValue
                                          ? "fill-[#EFBF04] text-[#EFBF04]"
                                          : "text-gray-200"
                                      }`}
                                    />
                                  ))}
                                  <span className="text-[10px] text-gray-400 font-medium ml-1">
                                    You rated this
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Right Side: Actions */}
                            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto justify-end">
                              {/* Delete Button (Rejected Only) */}
                              {isRejected && onDelete && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(booking.id);
                                  }}
                                  className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-white border border-red-200 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all shadow-sm text-xs font-bold"
                                >
                                  <Trash2 size={14} />
                                  <span>Delete</span>
                                </button>
                              )}

                              {/* Rate Button (Completed & Not Rated) */}
                              {!isTutor && !isRejected && !hasRated && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    setSelectedBookingForRate(booking)
                                  }
                                  className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#EFBF04] to-[#F59E0B] rounded-lg text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
                                >
                                  <Star size={14} className="fill-white" />
                                  Rate Tutor
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4 opacity-70">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                        <AlertCircle size={32} className="text-gray-400" />
                      </div>
                      <p
                        className={`${montserrat.className} font-medium text-gray-500`}
                      >
                        No history records found.
                      </p>
                    </div>
                  )}
                </div>

                {/* --- Footer --- */}
                <div className="p-4 md:p-5 border-t border-gray-200 bg-white shrink-0 flex justify-end rounded-b-[22px]">
                  <button
                    onClick={onClose}
                    className={`${montserrat.className} cursor-pointer px-6 py-2.5 bg-gray-100 border border-gray-300 hover:bg-gray-200 hover:border-gray-400 text-gray-700 font-bold rounded-xl transition-all active:scale-95 text-sm`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>

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
      )}
    </AnimatePresence>
  );
}

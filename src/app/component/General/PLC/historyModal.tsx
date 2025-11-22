"use client";

import React from "react";
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import { Booking } from "../../../../../supabase/Lib/PLC/usePLCBooking";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  isTutor: boolean;
  onDelete?: (id: string) => void; // Added optional delete handler
}

export default function HistoryModal({
  isOpen,
  onClose,
  bookings,
  isTutor,
  onDelete,
}: HistoryModalProps) {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[20px] w-full max-w-[800px] h-[80vh] shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={28} className="text-[#8B0E0E]" />
            <h2
              className={`${montserrat.className} text-[24px] font-bold text-black`}
            >
              Session History
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-gray-50">
          {bookings.length > 0 ? (
            bookings.map((booking) => {
              const isRejected = booking.status === "Rejected";
              const statusLabel = isRejected ? "Rejected" : "Completed";
              const statusBg = isRejected
                ? "bg-red-100 border-red-200 text-red-700"
                : "bg-green-100 border-green-200 text-green-700";

              // Logic for displaying names
              let otherPartyLabel = isTutor ? "Student:" : "Tutor:";
              let otherPartyName = "Unknown";

              if (isTutor) {
                otherPartyName =
                  booking.Accounts?.fullName || "Unknown Student";
              } else {
                // For students viewing history:
                if (isRejected) {
                  // If rejected, usually no tutor is assigned effectively, or we just hide it.
                  otherPartyName = "N/A";
                } else {
                  otherPartyName = booking.Tutor?.fullName || "Assigned Tutor";
                }
              }

              return (
                <div
                  key={booking.id}
                  className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group"
                >
                  <div className="flex flex-col gap-1">
                    <h3
                      className={`${montserrat.className} text-[18px] font-bold text-[#8B0E0E]`}
                    >
                      {booking.subject}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:gap-4 text-gray-600 text-sm mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span className={ptSans.className}>
                          {new Date(booking.bookingDate).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span className={ptSans.className}>
                          {formatTimeDisplay(
                            booking.startTime,
                            booking.endTime
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`${ptSans.className} text-sm font-bold text-gray-700`}
                      >
                        {otherPartyLabel}
                      </span>
                      <span
                        className={`${ptSans.className} text-sm text-black`}
                      >
                        {otherPartyName}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${statusBg}`}
                    >
                      {statusLabel}
                    </span>

                    {/* Delete Button only for Rejected items - Always Visible Card Style */}
                    {isRejected && onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(booking.id);
                        }}
                        className="flex items-center gap-2 px-2 py-2 bg-white border border-red-200 rounded-lg text-red-600 text-[10px] font-bold shadow-sm hover:bg-red-50 hover:border-red-300 hover:shadow-md transition-all"
                        title="Delete Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <AlertCircle size={48} className="opacity-20" />
              <p className={`${montserrat.className} font-medium`}>
                No history records found.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-[20px] shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className={`${montserrat.className} px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-colors`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

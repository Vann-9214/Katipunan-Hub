// src/app/component/General/PLC/fullDetails.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Ban, Trash2, MessageCircle, Star } from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import Avatar from "@/app/component/ReusableComponent/Avatar";
import RateTutorModal from "./rateTutorModal";

/* Fonts */
const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

/* Types */
interface TutorRating {
  rating: number;
  review: string;
}

interface BookingDetails {
  id: string;
  subject: string;
  startTime: string;
  endTime?: string;
  status: string;
  description?: string;
  bookingDate: string;
  studentId: string;
  hasRejected?: boolean;
  studentName?: string;
  studentCourse?: string;
  studentYear?: string;
  studentIDNum?: string;
  avatarURL?: string;
  tutorName?: string;
  Tutor?: {
    id: string;
    fullName: string;
  };
  TutorRatings?: TutorRating[];
}

interface RequestSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDetails | null;
  onCancelRequest: (bookingId: string) => void;
  isTutor?: boolean;
  onApproveRequest?: (bookingId: string) => void;
  onRejectRequest?: (bookingId: string) => void;
  onRateTutor?: (
    bookingId: string,
    tutorId: string,
    rating: number,
    review: string
  ) => Promise<void>;
  rejectionCount?: number;
  totalTutors?: number;
}

/* Helpers */
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(":", " : ");
};

const formatTimeRange = (start: string, end?: string) => {
  const s = formatTime(start);
  const e = end ? formatTime(end) : "";
  return e ? `${s} - ${e}` : s;
};

export default function FullDetails({
  isOpen,
  onClose,
  booking,
  onCancelRequest,
  isTutor = false,
  onApproveRequest,
  onRejectRequest,
  onRateTutor,
  rejectionCount = 0,
  totalTutors = 10,
}: RequestSessionModalProps) {
  const [now, setNow] = useState(new Date());
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);

  // Real-time clock to update status
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen || !booking) return null;

  // Logic to determine the "Real" status based on time
  const getComputedStatus = () => {
    if (booking.status !== "Approved") return booking.status;

    const [bYear, bMonth, bDay] = booking.bookingDate.split("-").map(Number);
    const bookingDate = new Date(bYear, bMonth - 1, bDay);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (bookingDate < today) return "Completed";
    if (bookingDate > today) return "Approved";

    if (!booking.startTime) return "Approved";

    const [startH, startM] = booking.startTime.split(":").map(Number);
    const start = new Date(now);
    start.setHours(startH, startM, 0, 0);

    const end = new Date(now);
    if (booking.endTime) {
      const [endH, endM] = booking.endTime.split(":").map(Number);
      end.setHours(endH, endM, 0, 0);
    } else {
      end.setTime(start.getTime() + 60 * 60 * 1000);
    }

    const current = new Date(now);
    if (current >= start && current < end) return "Starting...";
    if (current >= end) return "Completed";

    return "Approved";
  };

  const computedStatus = getComputedStatus();
  let displayStatus = computedStatus;
  let statusColor = "text-gray-600";

  if (isTutor && booking.hasRejected && booking.status === "Pending") {
    displayStatus = "Rejected";
    statusColor = "text-red-600";
  } else {
    if (computedStatus === "Pending") statusColor = "text-[#D97706]";
    else if (computedStatus === "Approved") statusColor = "text-green-600";
    else if (computedStatus === "Rejected") statusColor = "text-red-600";
    else if (computedStatus === "Completed") statusColor = "text-green-600";
    else if (computedStatus === "Starting...") statusColor = "text-[#EFBF04]";
  }

  const handleChatClick = () => {
    alert("Chat feature coming soon!");
  };

  // Check if user has already rated this session
  const ratingData =
    booking.TutorRatings && booking.TutorRatings.length > 0
      ? booking.TutorRatings[0]
      : null;
  const hasRated = !!ratingData;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-[20px] w-full max-w-[1055px] shadow-2xl relative px-8 py-4 flex flex-col items-center animate-in fade-in zoom-in duration-200">
          <button
            onClick={onClose}
            className="cursor-pointer absolute top-4 right-4 text-gray-500 hover:text-black"
          >
            <X size={20} />
          </button>

          <h2
            className={`${montserrat.className} text-[36px] font-semibold text-black mb-4`}
          >
            Request Session
          </h2>

          <div className="flex w-full gap-8">
            {/* Left Column: User Info */}
            <div className="flex-1 flex flex-col gap-6 border-r border-gray-300 pr-6">
              <div className="flex items-center gap-4">
                <Avatar
                  avatarURL={booking.avatarURL}
                  altText={booking.studentName || "User"}
                  className="w-20 h-20 shrink-0"
                />
                <div className="flex flex-col justify-center">
                  <p
                    className={`${montserrat.className} font-medium text-[22px] text-black`}
                  >
                    {booking.studentName || "Student Name"}
                  </p>
                  <p
                    className={`${ptSans.className} font-medium text-[20px] text-black`}
                  >
                    {booking.studentCourse || "Course"} &{" "}
                    {booking.studentYear || "Year"}
                  </p>
                  <p
                    className={`${ptSans.className} font-medium text-[20px] text-black`}
                  >
                    {booking.studentIDNum || "Student ID"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span
                  className={`${montserrat.className} text-[22px] text-black`}
                >
                  Subject Title:{" "}
                  <span className="font-medium">{booking.subject}</span>
                </span>
                <span
                  className={`${montserrat.className} text-[20px] text-black`}
                >
                  Description:{" "}
                  <span className="font-medium">
                    {booking.description || "No description"}
                  </span>
                </span>
              </div>
            </div>

            {/* Right Column: Session Details */}
            <div className="flex-1 flex flex-col justify-between py-2">
              <div className="flex flex-col gap-2">
                <p className={`${montserrat.className} text-[24px] text-black`}>
                  Date:{" "}
                  <span className="font-medium">
                    {formatDate(booking.bookingDate)}
                  </span>
                </p>
                <p className={`${montserrat.className} text-[24px] text-black`}>
                  Time:{" "}
                  <span className="font-medium">
                    {formatTimeRange(booking.startTime, booking.endTime)}
                  </span>
                </p>

                {/* Show Tutor Name if Approved/Starting/Completed */}
                {(computedStatus === "Approved" ||
                  computedStatus === "Starting..." ||
                  computedStatus === "Completed") &&
                  booking.tutorName && (
                    <p
                      className={`${montserrat.className} text-[24px] text-black`}
                    >
                      Tutor:{" "}
                      <span className="font-medium text-[#800000]">
                        {booking.tutorName}
                      </span>
                    </p>
                  )}

                {/* Hide "Declined Request" count if Approved/Starting/Completed */}
                {computedStatus !== "Approved" &&
                  computedStatus !== "Starting..." &&
                  computedStatus !== "Completed" && (
                    <p
                      className={`${montserrat.className} text-[24px] text-black`}
                    >
                      Declined Request:{" "}
                      <span className="font-medium">
                        {rejectionCount}/{totalTutors}
                      </span>
                    </p>
                  )}

                <p
                  className={`${
                    montserrat.className
                  } text-[24px] font-medium mt-1 ${statusColor} ${
                    displayStatus === "Starting..." ? "animate-pulse" : ""
                  }`}
                >
                  {displayStatus}
                </p>

                {/* --- Display Rating if exists --- */}
                {hasRated && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-700">
                        You Rated:
                      </span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={
                              i < ratingData!.rating
                                ? "fill-[#EFBF04] text-[#EFBF04]"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    {ratingData!.review && (
                      <p className="text-sm text-gray-600 italic">
                        &quot;{ratingData!.review}&quot;
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Buttons Section */}
              <div className="flex justify-end mt-6 gap-3">
                {/* TUTOR PENDING VIEW */}
                {isTutor &&
                  computedStatus === "Pending" &&
                  (booking.hasRejected ? (
                    <span className="text-red-600 font-bold text-sm self-center py-2 px-4">
                      Waiting for other tutors...
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => onRejectRequest?.(booking.id)}
                        className={`${montserrat.className} flex items-center gap-2 bg-red-100 text-red-700 cursor-pointer text-[12px] font-bold py-2 px-6 rounded-full hover:bg-red-200 transition-colors`}
                      >
                        <Ban size={18} /> Deny Request
                      </button>
                      <button
                        onClick={() => onApproveRequest?.(booking.id)}
                        className={`${montserrat.className} flex items-center gap-2 bg-[#8B0E0E] text-white cursor-pointer text-[12px] font-bold py-2 px-6 rounded-full hover:bg-[#6d0b0b] transition-colors`}
                      >
                        <Check size={18} /> Confirm Request
                      </button>
                    </>
                  ))}

                {/* STUDENT PENDING VIEW */}
                {!isTutor && computedStatus === "Pending" && (
                  <button
                    onClick={() => onCancelRequest(booking.id)}
                    className={`${montserrat.className} bg-[#8B0E0E] text-white cursor-pointer text-[12px] font-bold py-2 px-4 rounded-full hover:bg-[#6d0b0b] transition-colors`}
                  >
                    Cancel Request
                  </button>
                )}

                {/* REJECTED VIEW (DELETE) */}
                {!isTutor && computedStatus === "Rejected" && (
                  <button
                    onClick={() => onCancelRequest(booking.id)}
                    className={`${montserrat.className} flex items-center gap-2 bg-red-600 text-white cursor-pointer text-[12px] font-bold py-2 px-4 rounded-full hover:bg-red-700 transition-colors`}
                  >
                    <Trash2 size={16} /> Delete Booking
                  </button>
                )}

                {/* APPROVED VIEW (CHAT) - Hidden if Starting or Completed */}
                {computedStatus === "Approved" && (
                  <button
                    onClick={handleChatClick}
                    className={`${montserrat.className} flex items-center gap-2 bg-[#FFB74D] text-black cursor-pointer text-[12px] font-bold py-2 px-6 rounded-full hover:bg-[#ffa726] transition-colors`}
                  >
                    <MessageCircle size={18} />{" "}
                    {isTutor ? "Chat with Student" : "Chat with Tutor"}
                  </button>
                )}

                {/* RATE TUTOR BUTTON (Student Only, Completed, Not Rated) */}
                {!isTutor && computedStatus === "Completed" && !hasRated && (
                  <button
                    onClick={() => setIsRateModalOpen(true)}
                    className={`${montserrat.className} flex items-center gap-2 bg-[#EFBF04] text-black cursor-pointer text-[12px] font-bold py-2 px-6 rounded-full hover:bg-[#d4a903] transition-colors`}
                  >
                    <Star size={18} /> Rate Tutor
                  </button>
                )}

                <button
                  onClick={onClose}
                  className={`${montserrat.className} bg-gray-200 text-black cursor-pointer text-[12px] font-bold py-2 px-4 rounded-full hover:bg-gray-300 transition-colors`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal Popup */}
      <RateTutorModal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        tutorName={booking.tutorName || "Tutor"}
        onSubmit={async (rating, review) => {
          if (onRateTutor && booking.Tutor?.id) {
            await onRateTutor(booking.id, booking.Tutor.id, rating, review);
          }
        }}
      />
    </>
  );
}

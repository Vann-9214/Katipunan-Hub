"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Ban,
  Trash2,
  MessageCircle,
  Star,
  Calendar,
  Clock,
  FileText,
  Hash,
  Loader2,
} from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import Avatar from "@/app/component/ReusableComponent/Avatar";
import RateTutorModal from "./rateTutorModal";
import { motion, AnimatePresence } from "framer-motion";

// --- CHAT IMPORTS ---
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient";
import { getCurrentUserDetails } from "../../../../../supabase/Lib/General/getUser";
import { getSortedUserPair } from "../../../../../supabase/Lib/Message/auth";

/* Fonts */
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
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
  approvedBy?: string;
  hasRejected?: boolean;
  studentName?: string;
  studentCourse?: string;
  studentYear?: string;
  studentIDNum?: string;
  avatarURL?: string;
  tutorName?: string;
  // --- UPDATED: Added avatarURL to Tutor ---
  Tutor?: {
    id: string;
    fullName: string;
    avatarURL?: string | null;
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
  const [isChatLoading, setIsChatLoading] = useState(false);
  const router = useRouter();

  // Real-time clock
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Logic for status
  const getComputedStatus = () => {
    if (!booking) return "Pending";
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
  // --- FIX START: Defined isRejected here ---
  const isRejected = computedStatus === "Rejected";
  // --- FIX END ---

  let displayStatus = computedStatus;
  let statusBadgeClass = "bg-gray-100 text-gray-600 border-gray-200";

  if (booking) {
    if (isTutor && booking.hasRejected && booking.status === "Pending") {
      displayStatus = "Rejected";
      statusBadgeClass = "bg-red-50 text-red-600 border-red-200";
    } else {
      if (computedStatus === "Pending")
        statusBadgeClass = "bg-orange-50 text-[#D97706] border-orange-200";
      else if (computedStatus === "Approved")
        statusBadgeClass = "bg-green-50 text-green-600 border-green-200";
      else if (computedStatus === "Rejected")
        statusBadgeClass = "bg-red-50 text-red-600 border-red-200";
      else if (computedStatus === "Completed")
        statusBadgeClass = "bg-green-50 text-green-600 border-green-200";
      else if (computedStatus === "Starting...")
        statusBadgeClass =
          "bg-[#EFBF04]/10 text-[#EFBF04] border-[#EFBF04]/30 animate-pulse";
    }
  }

  // Chat Logic
  const handleChatClick = async () => {
    if (isChatLoading) return;
    setIsChatLoading(true);

    try {
      const user = await getCurrentUserDetails();
      if (!user) {
        alert("You must be logged in to chat.");
        setIsChatLoading(false);
        return;
      }

      let targetUserId = "";
      if (isTutor) {
        targetUserId = booking?.studentId || "";
      } else {
        targetUserId = booking?.Tutor?.id || "";
      }

      if (!targetUserId) {
        alert("Cannot find user to chat with.");
        setIsChatLoading(false);
        return;
      }

      const dateStr = formatDate(booking?.bookingDate || "");
      const timeStr = formatTimeRange(
        booking?.startTime || "",
        booking?.endTime
      );
      const subject = booking?.subject || "our session";

      let messageContent = "";

      if (isTutor) {
        messageContent = `Hi! I'll be your tutor for ${subject} on ${dateStr} at ${timeStr}. Do you have any specific topics you want to cover?`;
      } else {
        messageContent = `Hi! I'm looking forward to our ${subject} session on ${dateStr} at ${timeStr}. Let me know if there's anything I should prepare!`;
      }

      const { user_a_id, user_b_id } = getSortedUserPair(user.id, targetUserId);

      let conversationId = null;
      const { data: existingConvo } = await supabase
        .from("Conversations")
        .select("id")
        .eq("user_a_id", user_a_id)
        .eq("user_b_id", user_b_id)
        .single();

      if (existingConvo) {
        conversationId = existingConvo.id;
      } else {
        const { data: newConvo, error: createError } = await supabase
          .from("Conversations")
          .insert({
            user_a_id,
            user_b_id,
            last_message_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (createError || !newConvo) throw createError;
        conversationId = newConvo.id;
      }

      const { data: existingMessages } = await supabase
        .from("Messages")
        .select("id")
        .eq("conversation_id", conversationId)
        .eq("content", messageContent)
        .limit(1);

      const isDuplicate = existingMessages && existingMessages.length > 0;

      if (!isDuplicate) {
        const { error: msgError } = await supabase.from("Messages").insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: messageContent,
        });

        if (msgError) throw msgError;
      }

      router.push(`/Message/${conversationId}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Failed to start chat.");
      setIsChatLoading(false);
    }
  };

  const ratingData =
    booking?.TutorRatings && booking.TutorRatings.length > 0
      ? booking.TutorRatings[0]
      : null;
  const hasRated = !!ratingData;

  return (
    <>
      <AnimatePresence>
        {isOpen && booking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            {/* CONTAINER WITH GOLD BORDER */}
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative w-full max-w-[900px] max-h-[90vh] p-[2px] rounded-[24px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-2xl flex flex-col"
            >
              <div className="bg-white w-full h-full rounded-[22px] flex flex-col overflow-hidden shadow-inner relative">
                {/* HEADER: MAROON GRADIENT */}
                <div className="relative px-8 py-5 bg-gradient-to-b from-[#4e0505] to-[#3a0000] border-b border-[#EFBF04]/30 flex items-center justify-between shrink-0 z-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 blur-3xl rounded-full pointer-events-none" />
                  <h2
                    className={`${montserrat.className} text-[24px] font-bold text-white tracking-wide`}
                  >
                    Session Details
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white cursor-pointer active:scale-95"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* BODY: SPLIT LAYOUT */}
                <div className="flex flex-col md:flex-row w-full h-full overflow-hidden">
                  {/* LEFT PANEL: USER PROFILE */}
                  <div className="md:w-[320px] bg-gray-50 p-8 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col items-center text-center shrink-0 overflow-y-auto custom-scrollbar relative">
                    {/* Avatar with Gold Ring */}
                    <div className="relative mb-6">
                      <div className="absolute -inset-1 bg-gradient-to-br from-[#EFBF04] to-[#D4AF37] rounded-full opacity-70 blur-sm" />
                      <Avatar
                        avatarURL={booking.avatarURL}
                        altText={booking.studentName || "User"}
                        className="w-32 h-32 relative z-10"
                      />
                    </div>

                    {/* Name & Details */}
                    <div className="space-y-2 mb-8">
                      <h3
                        className={`${montserrat.className} text-[22px] font-bold text-[#1a1a1a] leading-tight`}
                      >
                        {booking.studentName || "Student Name"}
                      </h3>
                      <div className="flex flex-col gap-1">
                        <p
                          className={`${ptSans.className} text-[15px] text-gray-600 font-medium`}
                        >
                          {booking.studentCourse || "Course"}
                        </p>
                        <p
                          className={`${ptSans.className} text-[14px] text-gray-500`}
                        >
                          {booking.studentYear || "Year"}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600 text-xs font-bold mt-3 shadow-sm">
                        <Hash size={12} className="text-[#8B0E0E]" />
                        {booking.studentIDNum || "No ID"}
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div
                      className={`px-6 py-2 rounded-full border-2 font-bold text-sm tracking-wider shadow-sm ${statusBadgeClass} ${montserrat.className}`}
                    >
                      {displayStatus.toUpperCase()}
                    </div>
                  </div>

                  {/* RIGHT PANEL: SESSION INFO */}
                  <div className="flex-1 p-8 flex flex-col bg-white overflow-y-auto custom-scrollbar">
                    <div className="space-y-8 flex-grow">
                      {/* Subject Block */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FileText size={18} className="text-[#8B0E0E]" />
                          <span
                            className={`${montserrat.className} text-xs font-bold text-gray-400 uppercase tracking-widest`}
                          >
                            Subject
                          </span>
                        </div>
                        <p
                          className={`${montserrat.className} text-[24px] font-bold text-[#1a1a1a] leading-tight`}
                        >
                          {booking.subject}
                        </p>
                      </div>

                      {/* Description Block */}
                      <div>
                        <span
                          className={`${montserrat.className} text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2`}
                        >
                          Description
                        </span>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <p
                            className={`${ptSans.className} text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap`}
                          >
                            {booking.description || "No description provided."}
                          </p>
                        </div>
                      </div>

                      {/* Schedule Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#EFBF04]/5 border border-[#EFBF04]/20 p-4 rounded-xl flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-[#b48e00] mb-1">
                            <Calendar size={16} />
                            <span className="text-xs font-bold uppercase">
                              Date
                            </span>
                          </div>
                          <p
                            className={`${ptSans.className} text-[16px] font-bold text-gray-800`}
                          >
                            {formatDate(booking.bookingDate)}
                          </p>
                        </div>

                        <div className="bg-[#8B0E0E]/5 border border-[#8B0E0E]/20 p-4 rounded-xl flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-[#8B0E0E] mb-1">
                            <Clock size={16} />
                            <span className="text-xs font-bold uppercase">
                              Time
                            </span>
                          </div>
                          <p
                            className={`${ptSans.className} text-[16px] font-bold text-gray-800`}
                          >
                            {formatTimeRange(
                              booking.startTime,
                              booking.endTime
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Dynamic Tutor/Request Info */}
                      <div className="pt-4 border-t border-gray-100">
                        {(computedStatus === "Approved" ||
                          computedStatus === "Starting..." ||
                          computedStatus === "Completed") &&
                        booking.tutorName ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {/* --- UPDATED: Use Avatar Component for Tutor --- */}
                              <Avatar
                                avatarURL={booking.Tutor?.avatarURL}
                                altText={booking.tutorName}
                                className="w-10 h-10"
                              />
                              <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">
                                  Assigned Tutor
                                </p>
                                <p className="text-sm font-bold text-[#8B0E0E]">
                                  {booking.tutorName}
                                </p>
                              </div>
                            </div>
                            {hasRated && !isRejected && !isTutor && (
                              <div className="flex flex-col items-end">
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={14}
                                      className={
                                        i < ratingData!.rating
                                          ? "fill-[#EFBF04] text-[#EFBF04]"
                                          : "text-gray-200"
                                      }
                                    />
                                  ))}
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium mt-1">
                                  You rated this session
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200/60">
                            <Ban size={18} />
                            <p className="text-sm font-medium">
                              {rejectionCount} of {totalTutors} tutors have
                              declined this request.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ACTION FOOTER */}
                    <div className="flex flex-wrap justify-end gap-3 mt-6 pt-6 border-t border-gray-100 shrink-0">
                      {/* TUTOR: PENDING ACTIONS */}
                      {isTutor &&
                        computedStatus === "Pending" &&
                        (booking.hasRejected ? (
                          <span className="text-red-600 font-bold text-sm self-center px-4 bg-red-50 py-2 rounded-lg border border-red-100">
                            Waiting for other tutors...
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => onRejectRequest?.(booking.id)}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all text-sm cursor-pointer"
                            >
                              <Ban size={16} /> Deny
                            </button>
                            <button
                              onClick={() => onApproveRequest?.(booking.id)}
                              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8B0E0E] text-white font-bold hover:bg-[#6d0b0b] shadow-lg shadow-red-900/20 transition-all hover:scale-105 text-sm cursor-pointer"
                            >
                              <Check size={16} /> Accept
                            </button>
                          </>
                        ))}

                      {/* STUDENT: PENDING */}
                      {!isTutor && computedStatus === "Pending" && (
                        <button
                          onClick={() => onCancelRequest(booking.id)}
                          className="px-6 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-all text-sm cursor-pointer"
                        >
                          Cancel Request
                        </button>
                      )}

                      {/* REJECTED: DELETE */}
                      {!isTutor && computedStatus === "Rejected" && (
                        <button
                          onClick={() => onCancelRequest(booking.id)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 font-bold hover:bg-red-100 transition-all text-sm cursor-pointer"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      )}

                      {/* APPROVED: CHAT */}
                      {computedStatus === "Approved" && (
                        <button
                          onClick={handleChatClick}
                          disabled={isChatLoading}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FFB74D] to-[#F57C00] text-white font-bold hover:brightness-110 shadow-md transition-all hover:scale-105 disabled:opacity-70 text-sm cursor-pointer"
                        >
                          {isChatLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <MessageCircle size={16} />
                          )}
                          {isChatLoading ? "Opening..." : "Chat"}
                        </button>
                      )}

                      {/* COMPLETED: RATE */}
                      {!isTutor &&
                        computedStatus === "Completed" &&
                        !hasRated && (
                          <button
                            onClick={() => setIsRateModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#EFBF04] to-[#D4AF37] text-white font-bold hover:brightness-110 shadow-md transition-all hover:scale-105 text-sm cursor-pointer"
                          >
                            <Star size={16} className="fill-white" /> Rate Tutor
                          </button>
                        )}

                      {/* CLOSE BUTTON (Fallback) */}
                      {!isTutor &&
                        computedStatus !== "Pending" &&
                        computedStatus !== "Completed" &&
                        computedStatus !== "Rejected" && (
                          <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all text-sm cursor-pointer"
                          >
                            Close
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rating Modal */}
      {booking && (
        <RateTutorModal
          isOpen={isRateModalOpen}
          onClose={() => setIsRateModalOpen(false)}
          tutorName={booking.tutorName || "Tutor"}
          onSubmit={async (rating, review) => {
            if (onRateTutor && booking.Tutor?.id) {
              await onRateTutor(booking.id, booking.Tutor.id, rating, review);

              setIsRateModalOpen(false);
              onClose();
            }
          }}
        />
      )}
    </>
  );
}

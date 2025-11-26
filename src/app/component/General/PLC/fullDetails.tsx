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
  User,
  FileText,
  Hash,
  Loader2,
} from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import Avatar from "@/app/component/ReusableComponent/Avatar";
import RateTutorModal from "./rateTutorModal";
// 1. Import Motion
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
  const [isChatLoading, setIsChatLoading] = useState(false); // Loading state for chat
  const router = useRouter();

  // Real-time clock to update status
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Logic to determine the "Real" status based on time
  const getComputedStatus = () => {
    if (!booking) return "Pending"; // Safety check
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

  // Status Styling Logic
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

  // --- Handle Chat Click Logic ---
  const handleChatClick = async () => {
    if (isChatLoading) return;
    setIsChatLoading(true);

    try {
      // 1. Get Current User
      const user = await getCurrentUserDetails();
      if (!user) {
        alert("You must be logged in to chat.");
        setIsChatLoading(false);
        return;
      }

      // 2. Identify Target User
      let targetUserId = "";
      if (isTutor) {
        // I am tutor, chatting student
        targetUserId = booking?.studentId || "";
      } else {
        // I am student, chatting tutor
        targetUserId = booking?.Tutor?.id || "";
      }

      if (!targetUserId) {
        alert("Cannot find user to chat with.");
        setIsChatLoading(false);
        return;
      }

      // 3. Prepare Message Content (Dynamic based on role)
      const dateStr = formatDate(booking?.bookingDate || "");
      const timeStr = formatTimeRange(
        booking?.startTime || "",
        booking?.endTime
      );
      const subject = booking?.subject || "our session";

      let messageContent = "";

      if (isTutor) {
        // Message FROM Tutor TO Student
        messageContent = `Hi! I'll be your tutor for ${subject} on ${dateStr} at ${timeStr}. Do you have any specific topics you want to cover?`;
      } else {
        // Message FROM Student TO Tutor
        messageContent = `Hi! I'm looking forward to our ${subject} session on ${dateStr} at ${timeStr}. Let me know if there's anything I should prepare!`;
      }

      // 4. Find or Create Conversation
      const { user_a_id, user_b_id } = getSortedUserPair(user.id, targetUserId);

      // Check if exists
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
        // Create new
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

      // 5. Check if this message ALREADY exists in the conversation
      // This prevents duplicates if the user clicks "Chat" multiple times for the same booking
      const { data: existingMessages } = await supabase
        .from("Messages")
        .select("id")
        .eq("conversation_id", conversationId)
        .eq("content", messageContent)
        .limit(1);

      const isDuplicate = existingMessages && existingMessages.length > 0;

      // 6. Only insert if it's NOT a duplicate
      if (!isDuplicate) {
        const { error: msgError } = await supabase.from("Messages").insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: messageContent,
        });

        if (msgError) throw msgError;
      }

      // 7. Redirect
      router.push(`/Message/${conversationId}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Failed to start chat.");
      setIsChatLoading(false);
    }
  };

  // Check if user has already rated this session
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
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              // Added max-h to ensure it fits on screen and overflow-hidden to clip scrollbars correctly
              className="bg-white rounded-[24px] w-full max-w-[900px] max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-gray-100"
            >
              {/* Header */}
              <div className="relative px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
                <h2
                  className={`${montserrat.className} text-[28px] font-bold text-[#8B0E0E]`}
                >
                  Session Details
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500 hover:text-black"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Body Container */}
              <div className="flex flex-col md:flex-row w-full h-full overflow-hidden">
                {/* Left Column: User Info Card - Scrollable if needed */}
                <div className="md:w-[320px] bg-white p-8 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col items-center text-center shrink-0 overflow-y-auto custom-scrollbar">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-[#8B0E0E]/5 rounded-full blur-xl transform scale-110" />
                    <Avatar
                      avatarURL={booking.avatarURL}
                      altText={booking.studentName || "User"}
                      // Removed white border as requested
                      className="w-28 h-28 shadow-lg relative z-10"
                    />
                  </div>

                  <div className="space-y-1 mb-6">
                    <h3
                      className={`${montserrat.className} text-[22px] font-bold text-gray-900 leading-tight`}
                    >
                      {booking.studentName || "Student Name"}
                    </h3>
                    <p
                      className={`${ptSans.className} text-[16px] text-gray-500 font-medium`}
                    >
                      {booking.studentCourse || "Course"} •{" "}
                      {booking.studentYear || "Year"}
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold mt-2">
                      <Hash size={12} />
                      {booking.studentIDNum || "No ID"}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div
                    className={`px-5 py-2 rounded-full border font-bold text-sm tracking-wide ${statusBadgeClass} ${montserrat.className}`}
                  >
                    {displayStatus.toUpperCase()}
                  </div>
                </div>

                {/* Right Column: Session Data - Scrollable for long content */}
                <div className="flex-1 p-8 flex flex-col bg-white overflow-y-auto custom-scrollbar">
                  <div className="space-y-6 flex-grow">
                    {/* Subject & Description */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-[#8B0E0E]/10 rounded-lg text-[#8B0E0E] shrink-0">
                          <FileText size={20} />
                        </div>
                        {/* Added min-w-0 to allow text wrapping inside flex item */}
                        <div className="min-w-0 flex-1">
                          <span
                            className={`block text-sm font-bold text-gray-400 uppercase tracking-wider ${montserrat.className}`}
                          >
                            Subject
                          </span>
                          {/* Added break-words to handle very long titles */}
                          <p
                            className={`text-[20px] font-bold text-gray-900 ${montserrat.className} break-words`}
                          >
                            {booking.subject}
                          </p>
                        </div>
                      </div>

                      <div className="pl-[52px]">
                        {/* Added break-words and whitespace-pre-wrap to handle long descriptions */}
                        <p
                          className={`text-[16px] text-gray-600 leading-relaxed ${ptSans.className} break-words whitespace-pre-wrap`}
                        >
                          &quot;
                          {booking.description ||
                            "No additional description provided."}
                          &quot;
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-gray-100 w-full" />

                    {/* Date & Time Grid */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600 shrink-0">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <span
                            className={`block text-xs font-bold text-gray-400 uppercase tracking-wider ${montserrat.className}`}
                          >
                            Date
                          </span>
                          <p
                            className={`text-[18px] font-medium text-gray-900 ${ptSans.className}`}
                          >
                            {formatDate(booking.bookingDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                          <Clock size={20} />
                        </div>
                        <div>
                          <span
                            className={`block text-xs font-bold text-gray-400 uppercase tracking-wider ${montserrat.className}`}
                          >
                            Time
                          </span>
                          <p
                            className={`text-[18px] font-medium text-gray-900 ${ptSans.className}`}
                          >
                            {formatTimeRange(
                              booking.startTime,
                              booking.endTime
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Footer Info */}
                    <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      {(computedStatus === "Approved" ||
                        computedStatus === "Starting..." ||
                        computedStatus === "Completed") &&
                      booking.tutorName ? (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-full text-green-700 shrink-0">
                            <User size={18} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-500 uppercase">
                              Assigned Tutor
                            </span>
                            <p
                              className={`text-[16px] font-bold text-[#8B0E0E] ${montserrat.className}`}
                            >
                              {booking.tutorName}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-gray-500">
                          <div className="p-2 bg-gray-200 rounded-full shrink-0">
                            <Ban size={18} />
                          </div>
                          <div>
                            <span className="text-xs font-bold uppercase">
                              Request Status
                            </span>
                            <p
                              className={`text-[15px] font-medium ${ptSans.className}`}
                            >
                              {rejectionCount} of {totalTutors} tutors have
                              declined
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Rating Display */}
                    {hasRated && (
                      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-yellow-800 uppercase">
                            Your Rating
                          </span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
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
                          <p className="text-sm text-gray-700 italic break-words">
                            &quot;{ratingData!.review}&quot;
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Buttons Section */}
                  <div className="flex flex-wrap justify-end gap-3 mt-8 pt-6 border-t border-gray-100 shrink-0">
                    {/* TUTOR PENDING */}
                    {isTutor &&
                      computedStatus === "Pending" &&
                      (booking.hasRejected ? (
                        <span className="text-red-600 font-bold text-sm self-center px-4 bg-red-50 py-2 rounded-lg">
                          Waiting for other tutors...
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => onRejectRequest?.(booking.id)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 transition-all"
                          >
                            <Ban size={18} /> Deny
                          </button>
                          <button
                            onClick={() => onApproveRequest?.(booking.id)}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8B0E0E] text-white font-bold hover:bg-[#6d0b0b] shadow-lg shadow-red-900/20 transition-all hover:scale-105"
                          >
                            <Check size={18} /> Accept
                          </button>
                        </>
                      ))}

                    {/* STUDENT PENDING */}
                    {!isTutor && computedStatus === "Pending" && (
                      <button
                        onClick={() => onCancelRequest(booking.id)}
                        className="px-6 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-all"
                      >
                        Cancel Request
                      </button>
                    )}

                    {/* DELETE (Rejected) */}
                    {!isTutor && computedStatus === "Rejected" && (
                      <button
                        onClick={() => onCancelRequest(booking.id)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-all"
                      >
                        <Trash2 size={18} /> Delete
                      </button>
                    )}

                    {/* CHAT (Approved) */}
                    {computedStatus === "Approved" && (
                      <button
                        onClick={handleChatClick}
                        disabled={isChatLoading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FFB74D] text-white font-bold hover:bg-[#ffa726] shadow-lg shadow-orange-500/20 transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-wait"
                      >
                        {isChatLoading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <MessageCircle size={18} />
                        )}
                        {isChatLoading ? "Starting..." : "Chat"}
                      </button>
                    )}

                    {/* RATE (Completed & Not Rated) */}
                    {!isTutor &&
                      computedStatus === "Completed" &&
                      !hasRated && (
                        <button
                          onClick={() => setIsRateModalOpen(true)}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#EFBF04] text-white font-bold hover:bg-[#d9af09] shadow-lg shadow-yellow-500/20 transition-all hover:scale-105"
                        >
                          <Star size={18} /> Rate Tutor
                        </button>
                      )}

                    {/* Close (always visible if no primary action) */}
                    {!isTutor &&
                      computedStatus !== "Pending" &&
                      computedStatus !== "Completed" &&
                      computedStatus !== "Rejected" && (
                        <button
                          onClick={onClose}
                          className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all"
                        >
                          Close
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rating Modal Popup */}
      {booking && (
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
      )}
    </>
  );
}

"use client";

import React from "react";
import { X } from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient";
import Avatar from "@/app/component/ReusableComponent/Avatar";

/* Fonts */
const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

/* Types */
interface BookingDetails {
  id: string;
  subject: string;
  startTime: string;
  status: string;
  description?: string;
  bookingDate: string;
  studentId: string;
  studentName?: string;
  studentCourse?: string;
  studentYear?: string;
  studentIDNum?: string;
  avatarURL?: string;
}

interface RequestSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDetails | null;
  onCancelRequest: (bookingId: string) => void;
}

/* Helper to format date */
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

/* Helper to format time */
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

export default function FullDetails({
  isOpen,
  onClose,
  booking,
  onCancelRequest,
}: RequestSessionModalProps) {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[20px] w-full max-w-[1055px] shadow-2xl relative px-8 py-4 flex flex-col items-center animate-in fade-in zoom-in duration-200">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <h2
          className={`${montserrat.className} text-[36px] font-semibold text-black mb-4`}
        >
          Request Session
        </h2>

        {/* Content Grid */}
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

          {/* Right Column: Session Info */}
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
                  {formatTime(booking.startTime)}
                </span>
              </p>
              <p className={`${montserrat.className} text-[24px] text-black`}>
                Declined Request: <span className="font-medium">0/10</span>
              </p>

              {/* Status */}
              <p
                className={`${
                  montserrat.className
                } text-[24px] font-medium mt-1 ${
                  booking.status === "Pending"
                    ? "text-[#D97706]"
                    : booking.status === "Approved"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {booking.status}
              </p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => onCancelRequest(booking.id)}
                className={`${montserrat.className} bg-[#8B0E0E] text-white cursor-pointer text-[12px] font-bold py-2 px-4 rounded-full hover:bg-[#6d0b0b] transition-colors`}
              >
                Cancel Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

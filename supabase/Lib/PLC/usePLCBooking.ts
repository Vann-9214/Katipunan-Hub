"use client";

import { useState, useEffect } from "react";
import { getCurrentUserDetails } from "../General/getUser";
import type { User } from "../General/user";

// --- Types ---
export interface Booking {
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
  createdAt?: string;
  Accounts?: {
    fullName: string;
    course: string;
    year: string;
    studentID: string;
    avatarURL: string;
  };
  Tutor?: {
    id: string;
    fullName: string;
    avatarURL: string | null;
  };
  TutorRatings?: TutorRating[];
}

export interface TutorRating {
  rating: number;
  review: string;
}

export type MonthBooking = Pick<
  Booking,
  "id" | "bookingDate" | "status" | "approvedBy" | "startTime" | "endTime"
>;

const getDateString = (y: number, m: number, d: number) => {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
};

interface UsePLCBookingsResult {
  currentUser: User | null;
  isTutor: boolean;
  monthBookings: MonthBooking[];
  dayBookings: Booking[];
  historyBookings: Booking[];
  isLoadingDayBookings: boolean;
  isInitialLoading: boolean;
  cancelBooking: (bookingId: string) => Promise<void>;
  deleteHistoryBooking: (bookingId: string) => Promise<void>;
  approveBooking: (bookingId: string) => Promise<void>;
  denyBooking: (bookingId: string) => Promise<void>;
  getBookingStats: (
    bookingId: string
  ) => Promise<{ totalTutors: number; rejectionCount: number }>;
  refreshBookings: (silent?: boolean) => Promise<void>;
  getDateString: (y: number, m: number, d: number) => string;
  rateTutor: (
    bookingId: string,
    tutorId: string,
    rating: number,
    review: string
  ) => Promise<void>;
}

// --- Main Hook ---
export const usePLCBookings = (
  year: number,
  monthIndex: number,
  selectedDate: number | null
): UsePLCBookingsResult => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [monthBookings, setMonthBookings] = useState<MonthBooking[]>([
    {
      id: "plc-b-1",
      bookingDate: getDateString(year, monthIndex, 15),
      status: "Approved",
      startTime: "10:00 AM",
      endTime: "11:30 AM",
      approvedBy: "usr_maria_03",
    },
    {
      id: "plc-b-2",
      bookingDate: getDateString(year, monthIndex, 20),
      status: "Pending",
      startTime: "02:00 PM",
      endTime: "03:30 PM",
    },
  ]);
  const [dayBookings, setDayBookings] = useState<Booking[]>([
    {
      id: "plc-b-1",
      subject: "CS211 - Data Structures & Algorithms",
      startTime: "10:00 AM",
      endTime: "11:30 AM",
      status: "Approved",
      description: "Need help reviewing AVL trees and Graph representations.",
      bookingDate: getDateString(year, monthIndex, selectedDate || 15),
      studentId: "usr_mock_wildcat_01",
      approvedBy: "usr_maria_03",
      Tutor: {
        id: "usr_maria_03",
        fullName: "Maria Santos",
        avatarURL: "/Cit Logo.svg",
      },
      Accounts: {
        fullName: "Teknoy Student",
        course: "BS Computer Science",
        year: "3rd Year",
        studentID: "22-1234-567",
        avatarURL: "/Cit Logo.svg",
      },
    },
  ]);
  const [historyBookings, setHistoryBookings] = useState<Booking[]>([
    {
      id: "plc-h-1",
      subject: "MATH101 - Differential Calculus",
      startTime: "09:00 AM",
      endTime: "10:30 AM",
      status: "Completed",
      description: "Limits and Derivatives practice problems.",
      bookingDate: getDateString(year, monthIndex, 5),
      studentId: "usr_mock_wildcat_01",
      Tutor: {
        id: "usr_alex_02",
        fullName: "Alex Rivera",
        avatarURL: "/Cit Logo.svg",
      },
      TutorRatings: [{ rating: 5, review: "Great explanation on chain rule!" }],
    },
  ]);

  const [isLoadingDayBookings] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isTutor] = useState(false);

  useEffect(() => {
    getCurrentUserDetails().then((user) => {
      if (user) setCurrentUser(user);
      setIsInitialLoading(false);
    });
  }, []);

  const cancelBooking = async (bookingId: string) => {
    setDayBookings((prev) => prev.filter((b) => b.id !== bookingId));
    setMonthBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  const deleteHistoryBooking = async (bookingId: string) => {
    setHistoryBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  const approveBooking = async (bookingId: string) => {
    setDayBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "Approved" } : b))
    );
  };

  const denyBooking = async (bookingId: string) => {
    setDayBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "Rejected" } : b))
    );
  };

  const getBookingStats = async (_bookingId: string) => {
    return { totalTutors: 5, rejectionCount: 0 };
  };

  const refreshBookings = async () => {};

  const rateTutor = async (
    bookingId: string,
    _tutorId: string,
    rating: number,
    review: string
  ) => {
    setHistoryBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              TutorRatings: [{ rating, review }],
            }
          : b
      )
    );
  };

  return {
    currentUser,
    isTutor,
    monthBookings,
    dayBookings,
    historyBookings,
    isLoadingDayBookings,
    isInitialLoading,
    cancelBooking,
    deleteHistoryBooking,
    approveBooking,
    denyBooking,
    getBookingStats,
    refreshBookings,
    getDateString,
    rateTutor,
  };
};

export const usePLCYearBookings = (year: number) => {
  const [yearBookings] = useState<MonthBooking[]>([
    {
      id: "plc-b-1",
      bookingDate: `${year}-03-15`,
      status: "Approved",
      startTime: "10:00 AM",
      endTime: "11:30 AM",
    },
    {
      id: "plc-b-2",
      bookingDate: `${year}-03-20`,
      status: "Pending",
      startTime: "02:00 PM",
      endTime: "03:30 PM",
    },
  ]);

  return { yearBookings, getDateString };
};
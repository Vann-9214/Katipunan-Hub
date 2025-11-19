// src/app/component/General/PLC/hooks/usePLCBookings.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../General/supabaseClient";
import { getCurrentUserDetails } from "../General/getUser";
import type { User } from "../General/user";

// 1. Define types
export interface Booking {
  id: string;
  subject: string;
  startTime: string;
  status: string;
  description?: string;
  bookingDate: string;
  studentId: string;
}

export type MonthBooking = Pick<Booking, "id" | "bookingDate" | "status">;

const getDateString = (y: number, m: number, d: number) => {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
};

// --- Hook for Month View ---
export const usePLCBookings = (
  year: number,
  monthIndex: number,
  selectedDate: number | null
) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [monthBookings, setMonthBookings] = useState<MonthBooking[]>([]);
  const [dayBookings, setDayBookings] = useState<Booking[]>([]);
  const [isLoadingDayBookings, setIsLoadingDayBookings] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUserDetails();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  // Fetch colors for the grid
  const fetchMonthBookings = useCallback(async () => {
    if (!currentUser) return;
    const startStr = getDateString(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const endStr = getDateString(year, monthIndex, lastDay);

    const { data, error } = await supabase
      .from("PLCBookings")
      .select("id, bookingDate, status")
      .eq("studentId", currentUser.id)
      .gte("bookingDate", startStr)
      .lte("bookingDate", endStr);

    if (error) console.error("Error fetching month bookings:", error);
    else setMonthBookings(data || []);
  }, [currentUser, year, monthIndex]);

  // Fetch details for the side panel
  const fetchDayBookings = useCallback(async () => {
    if (!currentUser || !selectedDate) return;
    setIsLoadingDayBookings(true);
    const dateQuery = getDateString(year, monthIndex, selectedDate);

    const { data, error } = await supabase
      .from("PLCBookings")
      .select("*")
      .eq("studentId", currentUser.id)
      .eq("bookingDate", dateQuery);

    if (error) console.error("Error fetching day bookings:", error);
    else setDayBookings(data || []);
    
    setIsLoadingDayBookings(false);
  }, [currentUser, selectedDate, monthIndex, year]);

  const cancelBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from("PLCBookings")
      .delete()
      .eq("id", bookingId);
    if (error) throw error;
    fetchMonthBookings();
    fetchDayBookings();
  };

  const refreshBookings = () => {
    fetchMonthBookings();
    fetchDayBookings();
  };

  useEffect(() => {
    fetchMonthBookings();
  }, [fetchMonthBookings]);

  useEffect(() => {
    fetchDayBookings();
  }, [fetchDayBookings]);

  return {
    currentUser,
    monthBookings,
    dayBookings,
    isLoadingDayBookings,
    cancelBooking,
    refreshBookings,
    getDateString,
  };
};

// --- Hook for Year View ---
export const usePLCYearBookings = (year: number) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [yearBookings, setYearBookings] = useState<MonthBooking[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUserDetails();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  const fetchYearBookings = useCallback(async () => {
    if (!currentUser) return;
    // Grab everything for the whole year
    const startStr = `${year}-01-01`;
    const endStr = `${year}-12-31`;

    const { data, error } = await supabase
      .from("PLCBookings")
      .select("id, bookingDate, status")
      .eq("studentId", currentUser.id)
      .gte("bookingDate", startStr)
      .lte("bookingDate", endStr);

    if (error) console.error("Error fetching year bookings:", error);
    else setYearBookings(data || []);
  }, [currentUser, year]);

  useEffect(() => {
    fetchYearBookings();
  }, [fetchYearBookings]);

  return { yearBookings, getDateString };
};
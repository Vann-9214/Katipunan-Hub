"use client";

import { useState, useEffect, useCallback } from "react";
import { getCurrentUserDetails } from "@/database/supabase/General/getUser";
import type { User } from "@/database/supabase/General/user";
import {
  MonthBooking,
  getYearBookings,
  getDateString,
} from "@/database/supabase/PLC";

export const usePLCYearBookings = (year: number) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [yearBookings, setYearBookings] = useState<MonthBooking[]>([]);
  const [isTutor, setIsTutor] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUserDetails();
      setCurrentUser(user);
      if (user?.role?.includes("Tutor")) setIsTutor(true);
    };
    fetchUser();
  }, []);

  const fetchYearBookings = useCallback(async () => {
    if (!currentUser) return;

    const { data, error } = await getYearBookings(
      year,
      currentUser.id,
      isTutor
    );

    if (error) {
      console.error("Error fetching year bookings:", error);
      setYearBookings([]);
    } else if (data) {
      let filtered = data;
      if (isTutor) {
        filtered = filtered.filter((b) => {
          if (b.status === "Approved") return b.approvedBy === currentUser.id;
          return true;
        });
      }
      setYearBookings(filtered);
    }
  }, [currentUser, year, isTutor]);

  useEffect(() => {
    fetchYearBookings();
  }, [fetchYearBookings]);

  return { yearBookings, getDateString };
};

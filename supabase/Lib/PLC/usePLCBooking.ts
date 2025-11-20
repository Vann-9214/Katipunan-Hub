"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../General/supabaseClient";
import { getCurrentUserDetails } from "../General/getUser";
import type { User } from "../General/user";

export interface Booking {
  id: string;
  subject: string;
  startTime: string;
  status: string;
  description?: string;
  bookingDate: string;
  studentId: string;
  approvedBy?: string;
  hasRejected?: boolean;
  // Student Info
  Accounts?: {
    fullName: string;
    course: string;
    year: string;
    studentID: string;
    avatarURL: string;
  };
  // Tutor Info (New)
  Tutor?: {
    fullName: string;
  };
}

export type MonthBooking = Pick<Booking, "id" | "bookingDate" | "status" | "approvedBy">;

const getDateString = (y: number, m: number, d: number) => {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
};

export const usePLCBookings = (
  year: number,
  monthIndex: number,
  selectedDate: number | null
) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [monthBookings, setMonthBookings] = useState<MonthBooking[]>([]);
  const [dayBookings, setDayBookings] = useState<Booking[]>([]);
  const [isLoadingDayBookings, setIsLoadingDayBookings] = useState(false);
  const [isTutor, setIsTutor] = useState(false);
  const [myRejections, setMyRejections] = useState<string[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUserDetails();
      setCurrentUser(user);
      if (user?.role?.includes("Tutor")) {
        setIsTutor(true);
      }
    };
    fetchUser();
  }, []);

  const cleanupExpired = useCallback(async () => {
    const { error } = await supabase.rpc("delete_expired_pending_bookings");
    if (error) console.error("Error cleaning up expired bookings:", error);
  }, []);

  const fetchMyRejections = useCallback(async () => {
    if (!currentUser || !isTutor) return;
    const { data, error } = await supabase
      .from("TutorRejections")
      .select("bookingId")
      .eq("tutorId", currentUser.id);

    if (error) { 
        console.error("Error fetching rejections:", error);
    } else {
        setMyRejections(data.map((r: any) => r.bookingId || r.bookingid));
    }
  }, [currentUser, isTutor]);

  useEffect(() => {
    fetchMyRejections();
  }, [fetchMyRejections]);

  const filterBookingsForTutor = useCallback((bookings: any[]) => {
    if (!isTutor || !currentUser) return bookings;
    return bookings.filter(b => {
        if (b.status === 'Approved') {
            return b.approvedBy === currentUser.id;
        }
        return true;
    });
  }, [isTutor, currentUser]);


  const fetchMonthBookings = useCallback(async () => {
    if (!currentUser) return;
    await cleanupExpired();

    const startStr = getDateString(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const endStr = getDateString(year, monthIndex, lastDay);

    let query = supabase
      .from("PLCBookings")
      .select("id, bookingDate, status, approvedBy") 
      .gte("bookingDate", startStr)
      .lte("bookingDate", endStr);

    if (!isTutor) {
      query = query.eq("studentId", currentUser.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching month bookings:", error);
    } else {
      const filtered = isTutor ? filterBookingsForTutor(data || []) : (data || []);
      setMonthBookings(filtered);
    }
  }, [currentUser, year, monthIndex, isTutor, cleanupExpired, filterBookingsForTutor]);

  const fetchDayBookings = useCallback(async () => {
    if (!currentUser || !selectedDate) return;
    setIsLoadingDayBookings(true);
    await cleanupExpired();
    
    const dateQuery = getDateString(year, monthIndex, selectedDate);

    // --- UPDATED QUERY: Fetch Student AND Tutor info ---
    let query = supabase
      .from("PLCBookings")
      .select(`
        *, 
        Accounts:Accounts!PLCBookings_studentId_fkey (
            fullName, 
            course, 
            year, 
            studentID, 
            avatarURL
        ),
        Tutor:Accounts!PLCBookings_approvedBy_fkey (
            fullName
        )
      `)
      .eq("bookingDate", dateQuery);

    if (!isTutor) {
      query = query.eq("studentId", currentUser.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching day bookings:", error);
    } else {
      let filtered = isTutor ? filterBookingsForTutor(data || []) : (data || []);
      
      const mappedData = filtered.map((booking) => ({
        ...booking,
        hasRejected: myRejections.includes(booking.id),
      }));
      
      setDayBookings(mappedData);
    }

    setIsLoadingDayBookings(false);
  }, [currentUser, selectedDate, monthIndex, year, isTutor, myRejections, cleanupExpired, filterBookingsForTutor]);

  const cancelBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from("PLCBookings")
      .delete()
      .eq("id", bookingId);
    if (error) throw error;
    refreshBookings();
  };

  const approveBooking = async (bookingId: string) => {
     if (!currentUser) return;
     
     const { error } = await supabase
      .from("PLCBookings")
      .update({ 
          status: "Approved", 
          approvedBy: currentUser.id 
      })
      .eq("id", bookingId);

    if (error) throw error;
    refreshBookings();
  }

  const denyBooking = async (bookingId: string) => {
    const { error } = await supabase.rpc("deny_booking", {
      booking_id: bookingId,
    });

    if (error) throw error;
    
    setMyRejections(prev => [...prev, bookingId]);
    refreshBookings(); 
  };

  const getBookingStats = async (bookingId: string) => {
    const { data, error } = await supabase.rpc("get_booking_stats", {
        booking_id: bookingId
    });

    if (error || !data) {
        console.error("Stats fetch error:", error);
        return { totalTutors: 0, rejectionCount: 0 };
    }

    return {
        totalTutors: data.totalTutors || 0,
        rejectionCount: data.rejectionCount || 0
    };
  };

  const refreshBookings = () => {
    fetchMyRejections().then(() => {
        fetchMonthBookings();
        fetchDayBookings();
    });
  };

  useEffect(() => {
    fetchMonthBookings();
  }, [fetchMonthBookings]);

  useEffect(() => {
    fetchDayBookings();
  }, [fetchDayBookings]);

  return {
    currentUser,
    isTutor,
    monthBookings,
    dayBookings,
    isLoadingDayBookings,
    cancelBooking,
    approveBooking,
    denyBooking,
    getBookingStats,
    refreshBookings,
    getDateString,
  };
};

export const usePLCYearBookings = (year: number) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [yearBookings, setYearBookings] = useState<MonthBooking[]>([]);
  const [isTutor, setIsTutor] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUserDetails();
      setCurrentUser(user);
       if (user?.role?.includes("Tutor")) {
        setIsTutor(true);
      }
    };
    fetchUser();
  }, []);

  const fetchYearBookings = useCallback(async () => {
    if (!currentUser) return;
    
    const startStr = `${year}-01-01`;
    const endStr = `${year}-12-31`;

    let query = supabase
      .from("PLCBookings")
      .select("id, bookingDate, status, approvedBy")
      .gte("bookingDate", startStr)
      .lte("bookingDate", endStr);

    if (!isTutor) {
      query = query.eq("studentId", currentUser.id);
    }

    const { data, error } = await query;

    if (error) console.error("Error fetching year bookings:", error);
    else {
        let filtered = data || [];
        if (isTutor) {
            filtered = filtered.filter(b => {
                if (b.status === 'Approved') return b.approvedBy === currentUser.id;
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
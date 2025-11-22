"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../General/supabaseClient";
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
  };
  TutorRatings?: TutorRating[];
}

export interface TutorRating {
  rating: number;
  review: string;
}

export type MonthBooking = Pick<Booking, "id" | "bookingDate" | "status" | "approvedBy" | "startTime" | "endTime">;

const getDateString = (y: number, m: number, d: number) => {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
};

// --- Main Hook ---
export const usePLCBookings = (
  year: number,
  monthIndex: number,
  selectedDate: number | null
) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [monthBookings, setMonthBookings] = useState<MonthBooking[]>([]);
  const [dayBookings, setDayBookings] = useState<Booking[]>([]);
  const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
  const [isLoadingDayBookings, setIsLoadingDayBookings] = useState(false);
  const [isTutor, setIsTutor] = useState(false);
  const [myRejections, setMyRejections] = useState<string[]>([]);
  
  // New state to track which bookings I have rated
  const [myRatedBookingIds, setMyRatedBookingIds] = useState<string[]>([]);

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

  // --- 1. HELPERS ---

  // Helper to fetch list of IDs I have rated
  const fetchMyRatings = useCallback(async () => {
    if (!currentUser) return [];
    // If I am a student, I want to know which bookings I rated
    const { data } = await supabase
      .from("TutorRatings")
      .select("booking_id")
      .eq("student_id", currentUser.id);
    
    const ids = data?.map((row) => row.booking_id) || [];
    setMyRatedBookingIds(ids);
    return ids;
  }, [currentUser]);

  // Helper to inject "TutorRatings" mock object if ID is found in rated list
  // This tricks the UI into hiding the button (hasRated check)
  const injectRatingStatus = (bookings: Booking[], ratedIds: string[]) => {
    return bookings.map((b) => {
      const isRated = ratedIds.includes(b.id);
      return {
        ...b,
        // If rated, add a dummy array so UI sees booking.TutorRatings.length > 0
        TutorRatings: isRated ? [{ rating: 5, review: "Rated" }] : [],
      };
    });
  };

  // --- 2. FETCH FUNCTIONS ---

  // Month Fetch
  const fetchMonthBookings = useCallback(async () => {
    if (!currentUser) return;

    const startStr = getDateString(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const endStr = getDateString(year, monthIndex, lastDay);

    let query = supabase
      .from("PLCBookings")
      .select("*")
      .gte("bookingDate", startStr)
      .lte("bookingDate", endStr)
      .in("status", ["Pending", "Approved", "Rejected", "Completed"]);

    if (!isTutor) query = query.eq("studentId", currentUser.id);

    const { data, error } = await query;

    if (error) console.error("Error fetching month bookings:", error);

    if (data) {
      const filtered = isTutor
        ? data.filter(b => b.status === 'Approved' ? b.approvedBy === currentUser.id : true)
        : data;
      setMonthBookings(filtered);
    }
  }, [currentUser, year, monthIndex, isTutor]);

  // Day Fetch
  const fetchDayBookings = useCallback(async (silent = false, currentRatedIds: string[] = []) => {
    if (!currentUser || !selectedDate) return;

    if (!silent) setIsLoadingDayBookings(true);

    const dateQuery = getDateString(year, monthIndex, selectedDate);

    // 1. Removed TutorRatings from SQL (Fixes the crash)
    let query = supabase
      .from("PLCBookings")
      .select("*, Accounts:Accounts!PLCBookings_studentId_fkey (fullName, course, year, studentID, avatarURL), Tutor:Accounts!PLCBookings_approvedBy_fkey (id, fullName)")
      .eq("bookingDate", dateQuery)
      .in("status", ["Pending", "Approved", "Rejected", "Completed"])
      .order("createdAt", { ascending: false });

    if (!isTutor) query = query.eq("studentId", currentUser.id);

    const { data, error } = await query as { data: Booking[] | null; error: any };

    if (error) {
      console.error("Error fetching day bookings:", error);
    }

    if (data) {
      let filtered = isTutor
        ? data.filter(b => b.status === 'Approved' ? b.approvedBy === currentUser.id : true)
        : data;

      const now = new Date();
      filtered = filtered.filter((b) => {
        if (b.status === "Pending") {
          const bookingDateTime = new Date(`${b.bookingDate}T${b.startTime}`);
          if (bookingDateTime < now) return false;
        }
        return true;
      });

      // 2. Inject rating status manually
      // Use passed IDs if available (fresh), otherwise fall back to state
      const idsToCheck = currentRatedIds.length > 0 ? currentRatedIds : myRatedBookingIds;
      
      const mappedData = filtered.map((booking) => ({
        ...booking,
        hasRejected: myRejections.includes(booking.id),
        // Manual injection logic
        TutorRatings: idsToCheck.includes(booking.id) ? [{ rating: 5, review: "Rated" }] : [],
      }));

      setDayBookings(mappedData);
    }

    if (!silent) setIsLoadingDayBookings(false);
  }, [currentUser, selectedDate, monthIndex, year, isTutor, myRejections, myRatedBookingIds]);

  // History Fetch
  const fetchHistoryBookings = useCallback(async (currentRatedIds: string[] = []) => {
    if (!currentUser) return;
    
    // 1. Removed TutorRatings from SQL
    let query = supabase
      .from("PLCBookingHistory")
      .select(`*, Accounts:Accounts!plcbookinghistory_studentid_fkey (fullName, course, year, studentID, avatarURL), Tutor:Accounts!plcbookinghistory_approvedby_fkey (id, fullName)`)
      .order("bookingDate", { ascending: false });

    if (!isTutor) {
      query = query.eq("studentId", currentUser.id);
    } else {
      query = query.eq("approvedBy", currentUser.id);
    }

    const { data, error } = await query;
    if (error) console.error("Error fetching history:", error);
    
    if (data) {
      // 2. Inject rating status manually
      const idsToCheck = currentRatedIds.length > 0 ? currentRatedIds : myRatedBookingIds;
      
      const mappedHistory = data.map((booking: any) => ({
        ...booking,
        TutorRatings: idsToCheck.includes(booking.id) ? [{ rating: 5, review: "Rated" }] : [],
      }));

      setHistoryBookings(mappedHistory);
    }
  }, [currentUser, isTutor, myRatedBookingIds]);

  const fetchMyRejections = useCallback(async () => {
    if (!currentUser || !isTutor) return;
    const { data } = await supabase
      .from("TutorRejections")
      .select("bookingId")
      .eq("tutorId", currentUser.id);

    if (data) {
      setMyRejections(data.map((r: any) => r.bookingId || r.bookingid));
    }
  }, [currentUser, isTutor]);

  // --- 3. CENTRAL REFRESH ---
  const refreshBookings = useCallback(async (silent = false) => {
    // Await fresh ratings first
    const freshRatedIds = await fetchMyRatings();
    
    Promise.all([
      fetchMyRejections(),
      fetchMonthBookings(),
      fetchDayBookings(silent, freshRatedIds), // Pass fresh IDs
      fetchHistoryBookings(freshRatedIds)      // Pass fresh IDs
    ]);
  }, [fetchMyRatings, fetchMyRejections, fetchMonthBookings, fetchDayBookings, fetchHistoryBookings]);

  // --- 4. CLEANUP ENGINE ---
  const cleanupExpired = useCallback(async () => {
    const now = new Date();
    const dateStr = getDateString(now.getFullYear(), now.getMonth(), now.getDate());
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + ':00';

    try {
      await supabase.rpc('move_and_archive_bookings', {
        check_date: dateStr,
        check_time: timeStr
      });

      await supabase.rpc("delete_expired_pending_bookings", {
        check_date: dateStr,
        check_time: timeStr
      });

      const { error: manualError } = await supabase.from("PLCBookings")
        .delete()
        .eq("status", "Pending")
        .or(`bookingDate.lt.${dateStr},and(bookingDate.eq.${dateStr},startTime.lte.${timeStr})`);

      setTimeout(() => refreshBookings(true), 500);

    } catch (err) {
      console.error("Cleanup error:", err);
    }
  }, [refreshBookings]);

  // --- UTILS & ACTIONS ---
  const getBookingStats = async (bookingId: string) => {
    const { data, error } = await supabase.rpc("get_booking_stats", { booking_id: bookingId });
    if (error || !data) return { totalTutors: 0, rejectionCount: 0 };
    return { totalTutors: data.totalTutors || 0, rejectionCount: data.rejectionCount || 0 };
  };

  const cancelBooking = async (bookingId: string) => {
    const { error } = await supabase.from("PLCBookings").delete().eq("id", bookingId);
    if (!error) refreshBookings(false);
  };

  const deleteHistoryBooking = async (bookingId: string) => {
    const { error } = await supabase.from("PLCBookingHistory").delete().eq("id", bookingId);
    if (!error) refreshBookings(false);
  };

  const approveBooking = async (bookingId: string) => {
    if (!currentUser) return;
    const { error } = await supabase
      .from("PLCBookings")
      .update({ status: "Approved", approvedBy: currentUser.id })
      .eq("id", bookingId);
    if (!error) refreshBookings(false);
  }

  const denyBooking = async (bookingId: string) => {
    const { error } = await supabase.rpc("deny_booking", { booking_id: bookingId });
    if (!error) {
      setMyRejections(prev => [...prev, bookingId]);
      refreshBookings(false);
    }
  };

  const rateTutor = async (bookingId: string, tutorId: string, rating: number, review: string) => {
    if (!currentUser) return;
    
    const { error } = await supabase.from("TutorRatings").insert({
      booking_id: bookingId,
      student_id: currentUser.id,
      tutor_id: tutorId,
      rating,
      review
    });

    if (error) {
      console.error("Error rating tutor:", error);
      throw error;
    }

    // Archive immediately after rating
    const { error: archiveError } = await supabase.rpc('archive_booking_on_rate', { 
      target_booking_id: bookingId 
    });

    if (archiveError) {
      console.warn("Archive warning (might already be archived):", archiveError.message);
    }
    
    refreshBookings(false);
  };

  // --- EFFECTS ---

  // 1. On Load
  useEffect(() => {
    cleanupExpired().then(() => {});
    fetchMyRatings(); // Fetch initial ratings
  }, [cleanupExpired, fetchMyRatings]);

  // 2. LIVE TIMER
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      
      setDayBookings(prev => {
        const hasExpiredItem = prev.some(b => {
          if (b.status !== 'Pending') return false;
          const bookingTime = new Date(`${b.bookingDate}T${b.startTime}`);
          return bookingTime < now;
        });

        if (hasExpiredItem) {
          return prev.filter(b => {
            if (b.status === 'Pending') {
              const bookingTime = new Date(`${b.bookingDate}T${b.startTime}`);
              return bookingTime >= now;
            }
            return true;
          });
        }
        return prev;
      });

      cleanupExpired();

    }, 5000); 
    return () => clearInterval(interval);
  }, [cleanupExpired]);

  // 3. Realtime Subscription
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('plc-bookings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'TutorRatings' }, () => { refreshBookings(true); })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'PLCBookingHistory' },
        () => {
            // Slight delay to allow DB triggers to finish
            setTimeout(() => refreshBookings(true), 500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, refreshBookings]);

  return {
    currentUser,
    isTutor,
    monthBookings,
    dayBookings,
    historyBookings,
    isLoadingDayBookings,
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
    const startStr = `${year}-01-01`;
    const endStr = `${year}-12-31`;
    let query = supabase.from("PLCBookings").select("*").gte("bookingDate", startStr).lte("bookingDate", endStr);
    if (!isTutor) query = query.eq("studentId", currentUser.id);
    const { data, error } = await query;
    if (data) {
      let filtered = data;
      if (isTutor) {
        filtered = filtered.filter(b => {
          if (b.status === 'Approved') return b.approvedBy === currentUser.id;
          return true;
        });
      }
      setYearBookings(filtered);
    }
  }, [currentUser, year, isTutor]);

  useEffect(() => { fetchYearBookings(); }, [fetchYearBookings]);
  return { yearBookings, getDateString };
};
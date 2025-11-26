"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  getBookingStats: (bookingId: string) => Promise<{ totalTutors: number; rejectionCount: number }>;
  refreshBookings: (silent?: boolean) => Promise<void>;
  getDateString: (y: number, m: number, d: number) => string;
  rateTutor: (bookingId: string, tutorId: string, rating: number, review: string) => Promise<void>;
}

// --- Main Hook ---
export const usePLCBookings = (
  year: number,
  monthIndex: number,
  selectedDate: number | null
) : UsePLCBookingsResult => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [monthBookings, setMonthBookings] = useState<MonthBooking[]>([]);
  const [dayBookings, setDayBookings] = useState<Booking[]>([]);
  const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
  
  // Loading States
  const [isLoadingDayBookings, setIsLoadingDayBookings] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Start TRUE for immediate feedback

  const [isTutor, setIsTutor] = useState(false);
  const [myRejections, setMyRejections] = useState<string[]>([]);
  const [myRatedBookingIds, setMyRatedBookingIds] = useState<string[]>([]);

  // Refs to track state without re-rendering
  const isFetchingRef = useRef(false);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUserDetails();
      if (user) {
        setCurrentUser(user);
        if (user?.role?.includes("Tutor")) {
          setIsTutor(true);
        }
      } else {
        // If no user is found, stop loading so the app doesn't hang
        setIsInitialLoading(false);
      }
    };
    fetchUser();
  }, []);

  // --- 1. HELPERS ---

  const fetchMyRatings = useCallback(async () => {
    if (!currentUser) return [];
    const { data } = await supabase
      .from("TutorRatings")
      .select("booking_id")
      .eq("student_id", currentUser.id);
    
    const ids = data?.map((row) => row.booking_id) || [];
    setMyRatedBookingIds(ids);
    return ids;
  }, [currentUser]);

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

  // --- 2. FETCH FUNCTIONS ---

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

    if (error) {
      console.error("Error fetching month bookings:", JSON.stringify(error, null, 2));
      setMonthBookings([]); 
    }

    if (data) {
      const filtered = isTutor
        ? data.filter(b => b.status === 'Approved' ? b.approvedBy === currentUser.id : true)
        : data;
      setMonthBookings(filtered);
    }
  }, [currentUser, year, monthIndex, isTutor]);

  const fetchDayBookings = useCallback(async (silent = false, currentRatedIds: string[] = []) => {
    if (!currentUser) return;

    // --- FIX: Determine an effective date to fetch ---
    // If selectedDate is null (like in PLCContent), default to Today (if in current month) or 1st.
    // This ensures the promise actually does work and waits, keeping the loading screen up.
    let targetDay = selectedDate;
    if (!targetDay) {
      const now = new Date();
      if (now.getFullYear() === year && now.getMonth() === monthIndex) {
        targetDay = now.getDate();
      } else {
        targetDay = 1;
      }
    }

    if (!silent) setIsLoadingDayBookings(true);

    const dateQuery = getDateString(year, monthIndex, targetDay);

    // FIX: Using EXACT Mixed-Case constraint names from your DDL
    let query = supabase
      .from("PLCBookings")
      .select(`
        *, 
        Accounts:Accounts!PLCBookings_studentId_fkey (fullName, course, year, studentID, avatarURL), 
        Tutor:Accounts!PLCBookings_approvedBy_fkey (id, fullName)
      `)
      .eq("bookingDate", dateQuery)
      .in("status", ["Pending", "Approved", "Rejected", "Completed"])
      .order("createdAt", { ascending: false });

    if (!isTutor) query = query.eq("studentId", currentUser.id);

    const { data, error } = await query as { data: Booking[] | null; error: any };

    if (error) {
      console.error("Error fetching day bookings:", JSON.stringify(error, null, 2));
      setDayBookings([]); 
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

      const idsToCheck = currentRatedIds.length > 0 ? currentRatedIds : myRatedBookingIds;
      
      const mappedData = filtered.map((booking) => ({
        ...booking,
        hasRejected: myRejections.includes(booking.id),
        TutorRatings: idsToCheck.includes(booking.id) ? [{ rating: 5, review: "Rated" }] : [],
      }));

      setDayBookings(mappedData);
    } else {
       setDayBookings([]);
    }

    if (!silent) setIsLoadingDayBookings(false);
  }, [currentUser, selectedDate, monthIndex, year, isTutor, myRejections, myRatedBookingIds]);

  const fetchHistoryBookings = useCallback(async (currentRatedIds: string[] = []) => {
    if (!currentUser) return;
    
    let query = supabase
      .from("PLCBookingHistory")
      .select(`
        *, 
        Accounts:Accounts!plcbookinghistory_studentid_fkey (fullName, course, year, studentID, avatarURL), 
        Tutor:Accounts!plcbookinghistory_approvedby_fkey (id, fullName)
      `)
      .order("bookingDate", { ascending: false });

    if (!isTutor) {
      query = query.eq("studentId", currentUser.id);
    } else {
      query = query.eq("approvedBy", currentUser.id);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching history:", JSON.stringify(error, null, 2));
      setHistoryBookings([]); 
    }
    
    if (data) {
      const idsToCheck = currentRatedIds.length > 0 ? currentRatedIds : myRatedBookingIds;
      
      const mappedHistory = data.map((booking: any) => ({
        ...booking,
        TutorRatings: idsToCheck.includes(booking.id) ? [{ rating: 5, review: "Rated" }] : [],
      }));

      setHistoryBookings(mappedHistory);
    }
  }, [currentUser, isTutor, myRatedBookingIds]);

  // --- 3. CENTRAL REFRESH ---
  const refreshBookings = useCallback(async (silent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    // Only show full screen loader if not silent
    if (!silent) setIsInitialLoading(true);
    
    try {
      const freshRatedIds = await fetchMyRatings();
      
      // Execute all fetches. Because fetchDayBookings now defaults to a date,
      // this Promise.all will wait for the day data too!
      await Promise.all([
        fetchMyRejections(),
        fetchMonthBookings(),
        fetchDayBookings(silent, freshRatedIds), 
        fetchHistoryBookings(freshRatedIds)      
      ]);
    } catch (error) {
      console.error("Critical error during refreshBookings:", error);
    } finally {
      isFetchingRef.current = false;
      if (!silent) setIsInitialLoading(false);
    }
  }, [fetchMyRatings, fetchMyRejections, fetchMonthBookings, fetchDayBookings, fetchHistoryBookings]);

  // --- 4. CLEANUP ENGINE ---
  const cleanupExpired = useCallback(async () => {
    const now = new Date();
    const dateStr = getDateString(now.getFullYear(), now.getMonth(), now.getDate());
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + ':00';

    try {
      await Promise.all([
        supabase.rpc('move_and_archive_bookings', {
          check_date: dateStr,
          check_time: timeStr
        }),
        supabase.rpc("delete_expired_pending_bookings", {
          check_date: dateStr,
          check_time: timeStr
        }),
        supabase.from("PLCBookings")
          .delete()
          .eq("status", "Pending")
          .or(`bookingDate.lt.${dateStr},and(bookingDate.eq.${dateStr},startTime.lte.${timeStr})`)
      ]);

      // Silent refresh after cleanup
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

    const { error: archiveError } = await supabase.rpc('archive_booking_on_rate', { 
      target_booking_id: bookingId 
    });

    if (archiveError) {
      console.warn("Archive warning (might already be archived):", archiveError.message);
    }
    
    refreshBookings(false);
  };

  // --- EFFECTS ---

  // 1. MAIN DATA FETCHING
  // Runs when dependencies change (like switching months/days).
  // USES isFirstLoad to determine if it should show the full-screen loader.
  useEffect(() => {
    if (currentUser) {
      const shouldShowLoader = isFirstLoad.current;
      
      // If it's the first load, pass FALSE to 'silent' (show loader).
      // If it's NOT first load (switching dates), pass TRUE to 'silent' (hide loader).
      refreshBookings(!shouldShowLoader); 
      
      if (shouldShowLoader) {
        isFirstLoad.current = false;
      }
    }
  }, [currentUser, year, monthIndex, selectedDate, isTutor]);

  // 2. CLEANUP ON MOUNT
  // Runs only ONCE when the component mounts to clean db.
  useEffect(() => {
    if (currentUser) {
        cleanupExpired();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]); 

  // 3. LIVE TIMER
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

  // 4. Realtime Subscription
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('plc-bookings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'TutorRatings' }, () => { refreshBookings(true); })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'PLCBookingHistory' },
        () => {
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
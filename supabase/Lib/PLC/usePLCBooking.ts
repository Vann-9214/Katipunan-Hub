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
  // --- UPDATED: Added avatarURL ---
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

// Define a type for our ratings map
type RatingsMap = Map<string, TutorRating>;

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
  const [isInitialLoading, setIsInitialLoading] = useState(true); 

  const [isTutor, setIsTutor] = useState(false);
  const [myRejections, setMyRejections] = useState<string[]>([]);
  
  // State to store actual rating values, not just IDs
  const [myRatingsMap, setMyRatingsMap] = useState<RatingsMap>(new Map());

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
        setIsInitialLoading(false);
      }
    };
    fetchUser();
  }, []);

  // --- 1. HELPERS ---

  const fetchMyRatings = useCallback(async () => {
    if (!currentUser) return new Map();
    
    const { data } = await supabase
      .from("TutorRatings")
      .select("booking_id, rating, review")
      .eq("student_id", currentUser.id);
    
    const map = new Map<string, TutorRating>();
    
    if (data) {
        data.forEach((row: any) => {
            map.set(row.booking_id, { rating: row.rating, review: row.review });
        });
    }
    
    setMyRatingsMap(map);
    return map;
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

  const fetchDayBookings = useCallback(async (silent = false, passedMap: RatingsMap | null = null) => {
    if (!currentUser) return;

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

    // --- UPDATED: Added avatarURL to Tutor selection ---
    let query = supabase
      .from("PLCBookings")
      .select(`
        *, 
        Accounts:Accounts!PLCBookings_studentId_fkey (fullName, course, year, studentID, avatarURL), 
        Tutor:Accounts!PLCBookings_approvedBy_fkey (id, fullName, avatarURL)
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

      // Use passed map or fallback to state
      const mapToUse = passedMap || myRatingsMap;
      
      const mappedData = filtered.map((booking) => {
        const ratingData = mapToUse.get(booking.id);
        
        return {
          ...booking,
          hasRejected: myRejections.includes(booking.id),
          TutorRatings: ratingData ? [ratingData] : [],
        };
      });

      setDayBookings(mappedData);
    } else {
       setDayBookings([]);
    }

    if (!silent) setIsLoadingDayBookings(false);
  }, [currentUser, selectedDate, monthIndex, year, isTutor, myRejections, myRatingsMap]);

  const fetchHistoryBookings = useCallback(async (passedMap: RatingsMap | null = null) => {
    if (!currentUser) return;
    
    // --- UPDATED: Added avatarURL to Tutor selection ---
    let query = supabase
      .from("PLCBookingHistory")
      .select(`
        *, 
        Accounts:Accounts!plcbookinghistory_studentid_fkey (fullName, course, year, studentID, avatarURL), 
        Tutor:Accounts!plcbookinghistory_approvedby_fkey (id, fullName, avatarURL)
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
      const mapToUse = passedMap || myRatingsMap;
      
      const mappedHistory = data.map((booking: any) => {
        const ratingData = mapToUse.get(booking.id);
        
        return {
          ...booking,
          TutorRatings: ratingData ? [ratingData] : [],
        };
      });

      setHistoryBookings(mappedHistory);
    }
  }, [currentUser, isTutor, myRatingsMap]);

  // --- 3. CENTRAL REFRESH ---
  const refreshBookings = useCallback(async (silent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!silent) setIsInitialLoading(true);
    
    try {
      const freshRatingsMap = await fetchMyRatings();
      
      await Promise.all([
        fetchMyRejections(),
        fetchMonthBookings(),
        fetchDayBookings(silent, freshRatingsMap), 
        fetchHistoryBookings(freshRatingsMap)      
      ]);
    } catch (error) {
      console.error("Critical error during refreshBookings:", error);
    } finally {
      isFetchingRef.current = false;
      if (!silent) setIsInitialLoading(false);
    }
  }, [fetchMyRatings, fetchMyRejections, fetchMonthBookings, fetchDayBookings, fetchHistoryBookings]);

  // --- 4. CLEANUP ENGINE (UPDATED FOR NOTIFICATIONS) ---
  const cleanupExpired = useCallback(async () => {
    const now = new Date();
    const dateStr = getDateString(now.getFullYear(), now.getMonth(), now.getDate());
    // Ensure time string includes seconds for precise database comparison
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }); // "HH:mm:ss"

    try {
      // --- STEP 1: NOTIFY STUDENTS BEFORE ARCHIVING ---
      // Identify Approved bookings that have expired right now
      const { data: completedCandidates } = await supabase
        .from("PLCBookings")
        .select("id, studentId, subject")
        .eq("status", "Approved")
        .or(`bookingDate.lt.${dateStr},and(bookingDate.eq.${dateStr},endTime.lte.${timeStr})`);

      if (completedCandidates && completedCandidates.length > 0) {
         const notificationsToInsert = [];

         // Build notifications but check for duplicates first
         for (const b of completedCandidates) {
             const title = `Your PLC session for "${b.subject}" has been completed.`;
             
             // 1a. Check if we already notified this user about this specific completion
             // This prevents spam if the interval runs multiple times before the item is archived
             const { data: existing } = await supabase
                .from("UserNotifications")
                .select("id")
                .eq("user_id", b.studentId)
                .eq("title", title)
                .maybeSingle();

             if (!existing) {
                 notificationsToInsert.push({
                    user_id: b.studentId,
                    title: title,
                    type: 'system',
                    is_read: false
                 });
             }
         }

         // 1b. Insert only new notifications
         if (notificationsToInsert.length > 0) {
             await supabase.from("UserNotifications").insert(notificationsToInsert);
         }
      }

      // --- STEP 2: ARCHIVE (Move to History) ---
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

  // --- UPDATED DELETE HISTORY WITH LOGGING ---
  const deleteHistoryBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from("PLCBookingHistory")
      .delete()
      .eq("id", bookingId);

    if (error) {
      console.error("Failed to delete history:", error.message);
      alert(`Delete failed: ${error.message}. Check your database permissions.`);
    } else {
      refreshBookings(false);
    }
  };

  const approveBooking = async (bookingId: string) => {
    if (!currentUser) return;
    const { error } = await supabase
      .from("PLCBookings")
      .update({ status: "Approved", approvedBy: currentUser.id })
      .eq("id", bookingId);
    if (!error) refreshBookings(false);
  }

  // --- FIXED: DENY BOOKING (REMOVED DUPLICATE LOGIC) ---
  // We simply call the RPC. We do NOT fetch data or insert notifications client-side.
  // This prevents double notifications if the backend is already sending one.
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
  useEffect(() => {
    if (currentUser) {
      const shouldShowLoader = isFirstLoad.current;
      refreshBookings(!shouldShowLoader); 
      if (shouldShowLoader) {
        isFirstLoad.current = false;
      }
    }
  }, [currentUser, year, monthIndex, selectedDate, isTutor]);

  // 2. CLEANUP ON MOUNT
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
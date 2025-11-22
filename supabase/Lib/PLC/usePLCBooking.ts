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
  Accounts?: {
    fullName: string;
    course: string;
    year: string;
    studentID: string;
    avatarURL: string;
  };
  Tutor?: {
    fullName: string;
  };
  created_at?: string; 
}

// UPDATED: Added startTime and endTime here so Calendar grids can use them
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

  // --- 1. FETCH FUNCTIONS ---
  
  // Month Fetch
  const fetchMonthBookings = useCallback(async () => {
    if (!currentUser) return;
    
    const startStr = getDateString(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const endStr = getDateString(year, monthIndex, lastDay);

    // UPDATED: Added startTime, endTime to select
    let query = supabase
      .from("PLCBookings")
      .select("id, bookingDate, status, approvedBy, startTime, endTime") 
      .gte("bookingDate", startStr)
      .lte("bookingDate", endStr)
      .in("status", ["Pending", "Approved", "Rejected"]); 

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
  const fetchDayBookings = useCallback(async (silent = false) => {
    if (!currentUser || !selectedDate) return;
    
    if (!silent) setIsLoadingDayBookings(true);
    
    const dateQuery = getDateString(year, monthIndex, selectedDate);

    let query = supabase
      .from("PLCBookings")
      .select(`
        *, 
        Accounts:Accounts!PLCBookings_studentId_fkey (fullName, course, year, studentID, avatarURL), 
        Tutor:Accounts!PLCBookings_approvedBy_fkey (fullName)
      `)
      .eq("bookingDate", dateQuery)
      .in("status", ["Pending", "Approved", "Rejected"]); 

    if (!isTutor) query = query.eq("studentId", currentUser.id);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching day bookings:", error);
    }

    if (data) {
      let filtered = isTutor 
        ? data.filter(b => b.status === 'Approved' ? b.approvedBy === currentUser.id : true)
        : data;

      filtered.sort((a: any, b: any) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
      });

      const mappedData = filtered.map((booking) => ({
        ...booking,
        hasRejected: myRejections.includes(booking.id),
      }));
      
      setDayBookings(mappedData);
    }
    
    if (!silent) setIsLoadingDayBookings(false);
  }, [currentUser, selectedDate, monthIndex, year, isTutor, myRejections]);

  // History Fetch
  const fetchHistoryBookings = useCallback(async () => {
    if (!currentUser) return;
    let query = supabase
      .from("PLCBookingHistory") 
      .select(`*, Accounts:Accounts!plcbookinghistory_studentid_fkey (fullName, course, year, studentID, avatarURL), Tutor:Accounts!plcbookinghistory_approvedby_fkey (fullName)`)
      .order("bookingDate", { ascending: false });

    if (!isTutor) query = query.eq("studentId", currentUser.id);
    else query = query.eq("approvedBy", currentUser.id);

    const { data, error } = await query;
    if (error) console.error("Error fetching history:", error);
    if (data) setHistoryBookings(data);
  }, [currentUser, isTutor]);

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

  // --- 2. CENTRAL REFRESH ---
  const refreshBookings = useCallback((silent = false) => {
    fetchMyRejections().then(() => {
        fetchMonthBookings();
        fetchDayBookings(silent); 
        fetchHistoryBookings();
    });
  }, [fetchMyRejections, fetchMonthBookings, fetchDayBookings, fetchHistoryBookings]);

  // --- 3. CLEANUP ENGINE ---
  const cleanupExpired = useCallback(async () => {
    const now = new Date();
    const dateStr = getDateString(now.getFullYear(), now.getMonth(), now.getDate());
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    try {
        await supabase.rpc('move_and_archive_bookings', {
            check_date: dateStr,
            check_time: timeStr
        });

        const { error: deleteError } = await supabase.rpc("delete_expired_pending_bookings", {
            check_date: dateStr,
            check_time: timeStr
        });

        if (deleteError && deleteError.message?.includes("does not exist")) {
             await supabase.from("PLCBookings")
                .delete()
                .eq("status", "Pending")
                .or(`bookingDate.lt.${dateStr},and(bookingDate.eq.${dateStr},startTime.lte.${timeStr})`);
        }

        refreshBookings(true);

    } catch (err) {
        console.error("Cleanup error:", err);
    }
  }, [refreshBookings]);

  // --- UTILS ---
  const getBookingStats = async (bookingId: string) => {
    const { data, error } = await supabase.rpc("get_booking_stats", { booking_id: bookingId });
    if (error || !data) return { totalTutors: 0, rejectionCount: 0 };
    return { totalTutors: data.totalTutors || 0, rejectionCount: data.rejectionCount || 0 };
  };

  // --- ACTIONS ---
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

  // --- EFFECTS ---
  useEffect(() => {
    cleanupExpired().then(() => {});
  }, [cleanupExpired]);

  useEffect(() => {
    const interval = setInterval(() => {
      cleanupExpired();
    }, 10000);
    return () => clearInterval(interval);
  }, [cleanupExpired]);

  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('plc-bookings-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'PLCBookings' },
        () => refreshBookings(true)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'PLCBookingHistory' },
        () => fetchHistoryBookings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, refreshBookings, fetchHistoryBookings]);

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
      // UPDATED: Added startTime, endTime here too
      let query = supabase.from("PLCBookings").select("id, bookingDate, status, approvedBy, startTime, endTime").gte("bookingDate", startStr).lte("bookingDate", endStr);
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
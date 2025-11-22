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
  // Student Info
  Accounts?: {
    fullName: string;
    course: string;
    year: string;
    studentID: string;
    avatarURL: string;
  };
  // Tutor Info
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

  // --- CLEANUP & MOVE LOGIC ---
  const cleanupExpired = useCallback(async () => {
    const now = new Date();
    const dateStr = getDateString(now.getFullYear(), now.getMonth(), now.getDate());
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    try {
        const { error } = await supabase.rpc('move_and_archive_bookings', {
            check_date: dateStr,
            check_time: timeStr
        });

        if (error) console.error("Cleanup RPC Error:", error);

        await supabase.rpc("delete_expired_pending_bookings");

    } catch (err) {
        console.error("Unexpected error during cleanup:", err);
    }
  }, []);

  // --- REJECTION LISTENER ---
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

  // --- FILTER ---
  const filterBookingsForTutor = useCallback((bookings: any[]) => {
    if (!isTutor || !currentUser) return bookings;
    return bookings.filter(b => {
        if (b.status === 'Approved' || b.status === 'Completed') {
            return b.approvedBy === currentUser.id;
        }
        return true;
    });
  }, [isTutor, currentUser]);

  // --- FETCH ACTIVE (Month) ---
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
      .lte("bookingDate", endStr)
      .in("status", ["Pending", "Approved", "Rejected"]); 

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

  // --- FETCH ACTIVE (Day) ---
  const fetchDayBookings = useCallback(async () => {
    if (!currentUser || !selectedDate) return;
    setIsLoadingDayBookings(true);
    await cleanupExpired();
    
    const dateQuery = getDateString(year, monthIndex, selectedDate);

    let query = supabase
      .from("PLCBookings")
      .select(`
        *, 
        Accounts:Accounts!PLCBookings_studentId_fkey (
            fullName, course, year, studentID, avatarURL
        ),
        Tutor:Accounts!PLCBookings_approvedBy_fkey (
            fullName
        )
      `)
      .eq("bookingDate", dateQuery)
      .in("status", ["Pending", "Approved", "Rejected"]); 

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

  // --- FETCH HISTORY ---
  const fetchHistoryBookings = useCallback(async () => {
    if (!currentUser) return;
    
    let query = supabase
      .from("PLCBookingHistory") 
      .select(`
        *, 
        Accounts:Accounts!plcbookinghistory_studentid_fkey (fullName, course, year, studentID, avatarURL),
        Tutor:Accounts!plcbookinghistory_approvedby_fkey (fullName)
      `)
      .order("bookingDate", { ascending: false });

    if (!isTutor) {
      query = query.eq("studentId", currentUser.id);
    } else {
      query = query.eq("approvedBy", currentUser.id);
    }

    const { data, error } = await query;
    
    if (error) {
        console.error("Error fetching history:", error);
    } else {
      setHistoryBookings(data || []);
    }
  }, [currentUser, isTutor]);

  // --- UTILS ---
  const getBookingStats = async (bookingId: string) => {
    const { data, error } = await supabase.rpc("get_booking_stats", { booking_id: bookingId });
    if (error || !data) return { totalTutors: 0, rejectionCount: 0 };
    return { totalTutors: data.totalTutors || 0, rejectionCount: data.rejectionCount || 0 };
  };

  const refreshBookings = useCallback(() => {
    fetchMyRejections().then(() => {
        fetchMonthBookings();
        fetchDayBookings();
        fetchHistoryBookings();
    });
  }, [fetchMyRejections, fetchMonthBookings, fetchDayBookings, fetchHistoryBookings]);

  // --- ACTIONS ---
  const cancelBooking = async (bookingId: string) => {
    const { error } = await supabase.from("PLCBookings").delete().eq("id", bookingId);
    if (error) throw error;
    refreshBookings(); 
  };

  // **NEW: Delete from History**
  const deleteHistoryBooking = async (bookingId: string) => {
    const { error } = await supabase.from("PLCBookingHistory").delete().eq("id", bookingId);
    if (error) throw error;
    refreshBookings();
  };

  const approveBooking = async (bookingId: string) => {
     if (!currentUser) return;
     const { error } = await supabase
      .from("PLCBookings")
      .update({ status: "Approved", approvedBy: currentUser.id })
      .eq("id", bookingId);
    if (error) throw error;
    refreshBookings();
  }

  const denyBooking = async (bookingId: string) => {
    const { error } = await supabase.rpc("deny_booking", { booking_id: bookingId });
    if (error) throw error;
    setMyRejections(prev => [...prev, bookingId]);
    refreshBookings(); 
  };

  // --- INITIAL FETCH ---
  useEffect(() => {
    fetchMonthBookings();
  }, [fetchMonthBookings]);

  useEffect(() => {
    fetchDayBookings();
  }, [fetchDayBookings]);
  
  useEffect(() => {
    fetchHistoryBookings();
  }, [fetchHistoryBookings]);

  // --- REALTIME SUBSCRIPTION ---
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('plc-bookings-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'PLCBookings' },
        () => {
          console.log("Realtime (Active) change detected!");
          refreshBookings();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'PLCBookingHistory' },
        () => {
          console.log("Realtime (History) change detected!");
          fetchHistoryBookings(); // Specifically refresh history
        }
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
    deleteHistoryBooking, // Exported new function
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
      let query = supabase.from("PLCBookings").select("id, bookingDate, status, approvedBy").gte("bookingDate", startStr).lte("bookingDate", endStr);
      if (!isTutor) query = query.eq("studentId", currentUser.id);
      const { data, error } = await query;
      if (!error) {
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
  
    useEffect(() => { fetchYearBookings(); }, [fetchYearBookings]);
    return { yearBookings, getDateString };
};
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getCurrentUserDetails } from "@/database/supabase/General/getUser";
import type { User } from "@/database/supabase/General/user";
import {
  Booking,
  MonthBooking,
  RatingsMap,
  TutorRating,
  getMonthBookings,
  getDayBookings,
  getBookingHistory,
  getStudentRatings,
  getTutorRejections,
  cancelBooking as apiCancelBooking,
  deleteHistoryBooking as apiDeleteHistoryBooking,
  approveBooking as apiApproveBooking,
  denyBooking as apiDenyBooking,
  rateTutor as apiRateTutor,
  cleanupExpiredBookings,
  subscribeToPLCBookings,
  getBookingStats as apiGetBookingStats,
  getDateString,
} from "@/database/supabase/PLC";

export interface UsePLCBookingsResult {
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

export const usePLCBookings = (
  year: number,
  monthIndex: number,
  selectedDate: number | null
): UsePLCBookingsResult => {
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
  const isCleaningUpRef = useRef(false);

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
    if (!currentUser) return new Map<string, TutorRating>();

    const { data } = await getStudentRatings(currentUser.id);
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
    const { data } = await getTutorRejections(currentUser.id);

    if (data) {
      setMyRejections(data.map((r: any) => r.bookingId || r.bookingid));
    }
  }, [currentUser, isTutor]);

  // --- 2. FETCH FUNCTIONS ---
  const fetchMonthBookings = useCallback(async () => {
    if (!currentUser) return;

    const { data, error } = await getMonthBookings(
      year,
      monthIndex,
      currentUser.id,
      isTutor
    );

    if (error) {
      console.error(
        "Error fetching month bookings:",
        JSON.stringify(error, null, 2)
      );
      setMonthBookings([]);
    } else if (data) {
      const filtered = isTutor
        ? data.filter((b) =>
            b.status === "Approved" ? b.approvedBy === currentUser.id : true
          )
        : data;
      setMonthBookings(filtered);
    } else {
      setMonthBookings([]);
    }
  }, [currentUser, year, monthIndex, isTutor]);

  const fetchDayBookings = useCallback(
    async (silent = false, passedMap: RatingsMap | null = null) => {
      if (!currentUser) return;

      let targetDay = selectedDate;
      if (!targetDay) {
        const d = new Date();
        if (d.getFullYear() === year && d.getMonth() === monthIndex) {
          targetDay = d.getDate();
        } else {
          targetDay = 1;
        }
      }

      if (!silent) setIsLoadingDayBookings(true);

      const dateQuery = getDateString(year, monthIndex, targetDay);
      const { data, error } = await getDayBookings(
        dateQuery,
        currentUser.id,
        isTutor
      );

      if (error) {
        console.error(
          "Error fetching day bookings:",
          JSON.stringify(error, null, 2)
        );
        setDayBookings([]);
      }

      if (data) {
        let filtered = isTutor
          ? data.filter((b) =>
              b.status === "Approved" ? b.approvedBy === currentUser.id : true
            )
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
    },
    [
      currentUser,
      selectedDate,
      monthIndex,
      year,
      isTutor,
      myRejections,
      myRatingsMap,
    ]
  );

  const fetchHistoryBookings = useCallback(
    async (passedMap: RatingsMap | null = null) => {
      if (!currentUser) return;

      const { data, error } = await getBookingHistory(currentUser.id, isTutor);

      if (error) {
        console.error(
          "Error fetching history:",
          JSON.stringify(error, null, 2)
        );
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
    },
    [currentUser, isTutor, myRatingsMap]
  );

  // --- 3. CENTRAL REFRESH ---
  const refreshBookings = useCallback(
    async (silent = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (!silent) setIsInitialLoading(true);

      try {
        const freshRatingsMap = await fetchMyRatings();

        await Promise.all([
          fetchMyRejections(),
          fetchMonthBookings(),
          fetchDayBookings(silent, freshRatingsMap),
          fetchHistoryBookings(freshRatingsMap),
        ]);
      } catch (error) {
        console.error("Critical error during refreshBookings:", error);
      } finally {
        isFetchingRef.current = false;
        if (!silent) setIsInitialLoading(false);
      }
    },
    [
      fetchMyRatings,
      fetchMyRejections,
      fetchMonthBookings,
      fetchDayBookings,
      fetchHistoryBookings,
    ]
  );

  // --- 4. CLEANUP ENGINE ---
  const cleanupExpired = useCallback(async () => {
    if (isCleaningUpRef.current) return;

    const LOCK_KEY = "plc_cleanup_lock";
    const lastRun =
      typeof window !== "undefined" ? localStorage.getItem(LOCK_KEY) : "0";
    const now = Date.now();

    if (lastRun && now - parseInt(lastRun) < 60000) {
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(LOCK_KEY, now.toString());
    }

    isCleaningUpRef.current = true;

    const today = new Date();
    const dateStr = getDateString(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const timeStr = today.toLocaleTimeString("en-GB", { hour12: false });

    try {
      const { data, error } = await cleanupExpiredBookings(dateStr, timeStr);

      if (error) {
        console.error("❌ Cleanup RPC FAILED!", error);
      } else {
        refreshBookings(true);
      }
    } catch (err) {
      console.error("❌ Unexpected Cleanup Error:", err);
    } finally {
      isCleaningUpRef.current = false;
    }
  }, [refreshBookings]);

  // --- ACTIONS ---
  const getBookingStats = async (bookingId: string) => {
    return await apiGetBookingStats(bookingId);
  };

  const cancelBooking = async (bookingId: string) => {
    const { error } = await apiCancelBooking(bookingId);
    if (!error) refreshBookings(false);
  };

  const deleteHistoryBooking = async (bookingId: string) => {
    const { error } = await apiDeleteHistoryBooking(bookingId);
    if (error) {
      console.error("Failed to delete history:", error.message);
      alert(`Delete failed: ${error.message}. Check your database permissions.`);
    } else {
      refreshBookings(false);
    }
  };

  const approveBooking = async (bookingId: string) => {
    if (!currentUser) return;
    const { error } = await apiApproveBooking(bookingId, currentUser.id);
    if (!error) refreshBookings(false);
  };

  const denyBooking = async (bookingId: string) => {
    const { error } = await apiDenyBooking(bookingId);
    if (!error) {
      setMyRejections((prev) => [...prev, bookingId]);
      refreshBookings(false);
    }
  };

  const rateTutor = async (
    bookingId: string,
    tutorId: string,
    rating: number,
    review: string
  ) => {
    if (!currentUser) return;

    await apiRateTutor({
      bookingId,
      studentId: currentUser.id,
      tutorId,
      rating,
      review,
    });

    refreshBookings(false);
  };

  // --- EFFECTS ---
  useEffect(() => {
    if (currentUser) {
      const shouldShowLoader = isFirstLoad.current;
      refreshBookings(!shouldShowLoader);
      if (shouldShowLoader) {
        isFirstLoad.current = false;
      }
    }
  }, [currentUser, year, monthIndex, selectedDate, isTutor]);

  useEffect(() => {
    if (currentUser) {
      cleanupExpired();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Live Timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      setDayBookings((prev) => {
        const hasExpiredItem = prev.some((b) => {
          if (b.status !== "Pending") return false;
          const bookingTime = new Date(`${b.bookingDate}T${b.startTime}`);
          return bookingTime < now;
        });

        if (hasExpiredItem) {
          return prev.filter((b) => {
            if (b.status === "Pending") {
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

  // Realtime Subscription
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToPLCBookings(() => {
      refreshBookings(true);
    });

    return () => {
      unsubscribe();
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

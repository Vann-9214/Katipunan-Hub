import { supabase } from "../General/supabaseClient";
import type { MonthBooking, Booking } from "./types";

export const getDateString = (y: number, m: number, d: number) => {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
};

export async function getMonthBookings(
  year: number,
  monthIndex: number,
  userId: string,
  isTutor: boolean
): Promise<{ data: MonthBooking[] | null; error: any }> {
  const startStr = getDateString(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const endStr = getDateString(year, monthIndex, lastDay);

  let query = supabase
    .from("PLCBookings")
    .select("*")
    .gte("bookingDate", startStr)
    .lte("bookingDate", endStr)
    .in("status", ["Pending", "Approved", "Rejected", "Completed"]);

  if (!isTutor) query = query.eq("studentId", userId);

  const { data, error } = await query;
  return { data: data as MonthBooking[] | null, error };
}

export async function getDayBookings(
  dateQuery: string,
  userId: string,
  isTutor: boolean
): Promise<{ data: Booking[] | null; error: any }> {
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

  if (!isTutor) query = query.eq("studentId", userId);

  const { data, error } = await (query as any);
  return { data: data as Booking[] | null, error };
}

export async function getYearBookings(
  year: number,
  userId: string,
  isTutor: boolean
): Promise<{ data: MonthBooking[] | null; error: any }> {
  const startStr = `${year}-01-01`;
  const endStr = `${year}-12-31`;

  let query = supabase
    .from("PLCBookings")
    .select("*")
    .gte("bookingDate", startStr)
    .lte("bookingDate", endStr);

  if (!isTutor) query = query.eq("studentId", userId);

  const { data, error } = await query;
  return { data: data as MonthBooking[] | null, error };
}

export async function getBookingHistory(
  userId: string,
  isTutor: boolean
): Promise<{ data: Booking[] | null; error: any }> {
  let query = supabase
    .from("PLCBookingHistory")
    .select(`
      *, 
      Accounts:Accounts!plcbookinghistory_studentid_fkey (fullName, course, year, studentID, avatarURL), 
      Tutor:Accounts!plcbookinghistory_approvedby_fkey (id, fullName, avatarURL)
    `)
    .order("bookingDate", { ascending: false });

  if (!isTutor) {
    query = query.eq("studentId", userId);
  } else {
    query = query.eq("approvedBy", userId);
  }

  const { data, error } = await (query as any);
  return { data: data as Booking[] | null, error };
}

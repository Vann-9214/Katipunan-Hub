import { supabase } from "../General/supabaseClient";
import type { CreateBookingParams } from "./types";

export async function createBooking(params: CreateBookingParams) {
  const { data, error } = await supabase.from("PLCBookings").insert({
    studentId: params.studentId,
    bookingDate: params.bookingDate,
    startTime: params.startTime,
    endTime: params.endTime,
    subject: params.subject,
    description: params.description,
    status: params.status || "Pending",
  });

  return { data, error };
}

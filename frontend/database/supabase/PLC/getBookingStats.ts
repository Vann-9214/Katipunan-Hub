import { supabase } from "../General/supabaseClient";
import type { BookingStats } from "./types";

export async function getBookingStats(bookingId: string): Promise<BookingStats> {
  const { data, error } = await supabase.rpc("get_booking_stats", {
    booking_id: bookingId,
  });

  if (error || !data) {
    return { totalTutors: 0, rejectionCount: 0 };
  }

  return {
    totalTutors: data.totalTutors || 0,
    rejectionCount: data.rejectionCount || 0,
  };
}

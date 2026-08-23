import { supabase } from "../General/supabaseClient";

export async function cleanupExpiredBookings(
  checkDate: string,
  checkTime: string
) {
  const { data, error } = await supabase.rpc("cleanup_expired_bookings", {
    check_date: checkDate,
    check_time: checkTime,
  });

  return { data, error };
}

import { supabase } from "../General/supabaseClient";

export async function denyBooking(bookingId: string) {
  const { data, error } = await supabase.rpc("deny_booking", {
    booking_id: bookingId,
  });

  return { data, error };
}

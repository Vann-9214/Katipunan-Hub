import { supabase } from "../General/supabaseClient";

export async function deleteHistoryBooking(bookingId: string) {
  const { error } = await supabase
    .from("PLCBookingHistory")
    .delete()
    .eq("id", bookingId);

  return { error };
}

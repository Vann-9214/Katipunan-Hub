import { supabase } from "../General/supabaseClient";

export async function cancelBooking(bookingId: string) {
  const { error } = await supabase
    .from("PLCBookings")
    .delete()
    .eq("id", bookingId);

  return { error };
}

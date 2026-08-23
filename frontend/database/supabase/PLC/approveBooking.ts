import { supabase } from "../General/supabaseClient";

export async function approveBooking(bookingId: string, tutorId: string) {
  const { data, error } = await supabase
    .from("PLCBookings")
    .update({ status: "Approved", approvedBy: tutorId })
    .eq("id", bookingId);

  return { data, error };
}

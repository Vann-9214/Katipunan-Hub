import { supabase } from "../General/supabaseClient";

export function subscribeToPLCBookings(onUpdate: () => void) {
  const channel = supabase
    .channel(`plc-bookings-realtime_${Date.now()}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "PLCBookings" },
      () => {
        onUpdate();
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "TutorRatings" },
      () => {
        onUpdate();
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "PLCBookingHistory" },
      () => {
        setTimeout(() => onUpdate(), 500);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

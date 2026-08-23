import { supabase } from "../General/supabaseClient";

export interface RateTutorParams {
  bookingId: string;
  studentId: string;
  tutorId: string;
  rating: number;
  review: string;
}

export async function rateTutor({
  bookingId,
  studentId,
  tutorId,
  rating,
  review,
}: RateTutorParams) {
  // 1. Insert the rating
  const { error } = await supabase.from("TutorRatings").insert({
    booking_id: bookingId,
    student_id: studentId,
    tutor_id: tutorId,
    rating,
    review,
  });

  if (error) {
    console.error("Error rating tutor:", error);
    throw error;
  }

  // 2. Archive the booking
  const { error: archiveError } = await supabase.rpc(
    "archive_booking_on_rate",
    {
      target_booking_id: bookingId,
    }
  );

  if (archiveError) {
    console.warn(
      "Archive warning (might already be archived):",
      archiveError.message
    );
  }

  return { success: true };
}

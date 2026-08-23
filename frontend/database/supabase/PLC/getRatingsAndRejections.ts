import { supabase } from "../General/supabaseClient";

export async function getStudentRatings(studentId: string) {
  const { data, error } = await supabase
    .from("TutorRatings")
    .select("booking_id, rating, review")
    .eq("student_id", studentId);

  return { data, error };
}

export async function getTutorRejections(tutorId: string) {
  const { data, error } = await supabase
    .from("TutorRejections")
    .select("bookingId")
    .eq("tutorId", tutorId);

  return { data, error };
}

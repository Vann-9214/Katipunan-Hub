import { supabase } from "../General/supabaseClient";
import { FeedPost, PLCHighlight } from "./types";

// --- 1. Fetch General Feeds (Unchanged) ---
export async function getFeeds(): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from("Feeds")
    .select(`
      id,
      content,
      images,
      created_at,
      author_id,
      Accounts!Feeds_author_id_fkey (
        id,
        fullName,
        avatarURL,
        role
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching feeds:", error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    content: item.content,
    images: item.images || [],
    created_at: item.created_at,
    author: item.Accounts,
  }));
}

// --- 2. Create New Feed Post (Unchanged) ---
export async function createFeedPost(content: string, images: string[], authorId: string) {
  const { error } = await supabase.from("Feeds").insert({
    content,
    images,
    author_id: authorId,
  });

  if (error) throw error;
}

// --- 3. Fetch PLC "Hall of Fame" (From TutorRatings) ---
export async function getPLCHighlights(): Promise<PLCHighlight[]> {
  // Fetch ALL ratings, ordered by highest rating first, then newest
  const { data, error } = await supabase
    .from("TutorRatings")
    .select(`
      id,
      rating,
      review,
      created_at,
      booking_id,
      Tutor:Accounts!TutorRatings_tutor_id_fkey (fullName, avatarURL),
      Student:Accounts!TutorRatings_student_id_fkey (fullName)
    `)
    .order("rating", { ascending: false }) 
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching PLC highlights:", error);
    return [];
  }

  // Manually fetch subject from Booking table (since there is no FK on booking_id in your provided schema)
  const enrichedData = await Promise.all(
    data.map(async (item: any) => {
      // Try to find the subject in History or Active bookings
      const { data: booking } = await supabase
        .from("PLCBookingHistory")
        .select("subject")
        .eq("id", item.booking_id)
        .maybeSingle();
        
      let subject = booking?.subject;
      
      if (!subject) {
         const { data: active } = await supabase
        .from("PLCBookings")
        .select("subject")
        .eq("id", item.booking_id)
        .maybeSingle();
        subject = active?.subject || "Session";
      }

      return {
        id: item.id,
        tutorName: item.Tutor?.fullName || "Unknown Tutor",
        tutorAvatar: item.Tutor?.avatarURL,
        studentName: item.Student?.fullName || "Anonymous",
        rating: item.rating,
        review: item.review,
        subject: subject,
        created_at: item.created_at,
      };
    })
  );

  return enrichedData;
}
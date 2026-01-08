import { supabase } from "../General/supabaseClient";
import { FeedPost, PLCHighlight } from "./types";

// --- 1. Fetch General Feeds (Optimized for Pagination) ---
// Add pagination parameters (page and limit)
// supabase/Lib/Feeds/feeds.ts

export async function getFeeds(page = 0, limit = 10): Promise<{ posts: FeedPost[], count: number | null }> {
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("Feeds")
    .select(`
      id,
      content,
      images,
      created_at,
      author_id,
      author:Accounts!Feeds_author_id_fkey (
        id,
        fullName,
        avatarURL,
        role
      )
    `, { count: 'exact' })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching feeds:", error.message || error);
    return { posts: [], count: 0 };
  }

  const posts = data.map((item: any) => ({
    id: item.id,
    content: item.content,
    images: item.images || [],
    created_at: item.created_at,
    author: item.author,
  }));
  
  return { posts, count };
}

// --- NEW: Update Feed Post (Unchanged) ---
export async function updateFeedPost(id: string, content: string, images: string[]) {
  const { error } = await supabase
    .from("Feeds")
    .update({
      content,
      images,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

// --- 3. Fetch PLC "Hall of Fame" (Optimized N+1 Query) ---
export async function getPLCHighlights(): Promise<PLCHighlight[]> {
  // 1. Fetch ALL ratings (This remains ONE efficient query)
  const { data: ratingsData, error } = await supabase
    .from("TutorRatings")
    .select(`
      id,
      rating,
      review,
      created_at,
      booking_id,
      Tutor:Accounts!TutorRatings_tutor_id_fkey (id, fullName, avatarURL),
      Student:Accounts!TutorRatings_student_id_fkey (fullName)
    `)
    .order("rating", { ascending: false }) 
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching PLC highlights:", error);
    return [];
  }

  if (ratingsData.length === 0) return [];

  // 2. Extract all unique booking IDs
  const bookingIds = ratingsData.map((item: any) => item.booking_id);

  // 3. Batch fetch subjects from PLCBookingHistory (ONE database query to replace N queries)
  const { data: historyBookings } = await supabase
    .from("PLCBookingHistory")
    .select("id, subject")
    .in("id", bookingIds);

  const historyMap = new Map(historyBookings?.map(b => [b.id, b.subject]));

  // 4. Batch fetch subjects from PLCBookings (ONE database query to replace N queries)
  const { data: activeBookings } = await supabase
    .from("PLCBookings")
    .select("id, subject")
    .in("id", bookingIds);

  const activeMap = new Map(activeBookings?.map(a => [a.id, a.subject]));


  // 5. Consolidate and enrich data in memory (Fast, non-blocking operation)
  const enrichedData = ratingsData.map((item: any) => {
      // Look up subject in the in-memory maps
      let subject = historyMap.get(item.booking_id) || activeMap.get(item.booking_id) || "Session";

      return {
        id: item.id,
        tutorId: item.Tutor?.id || "", 
        tutorName: item.Tutor?.fullName || "Unknown Tutor",
        tutorAvatar: item.Tutor?.avatarURL,
        studentName: item.Student?.fullName || "Anonymous",
        rating: item.rating,
        review: item.review,
        subject: subject,
        created_at: item.created_at,
      };
    });

  return enrichedData;
}
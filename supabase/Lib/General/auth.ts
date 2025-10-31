import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Initialize Supabase Client for client components
// This client automatically uses the user's session cookie.
export const supabase = createClientComponentClient();

// Define the structure for the comprehensive user object
export interface FullUser {
  id: string;
  email: string | undefined;
  fullName: string;
  avatarURL: string;
  role: string;
  course: string;
  studentID: string;
  year: string;
}

/**
 * Fetches the authenticated user and their additional details from the Accounts table.
 */
export async function getCurrentUserDetails(): Promise<FullUser | null> {
  // 1. Get the authenticated user from Supabase auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("❌ No user found or not logged in.");
    return null;
  }

  // 2. Fetch additional details from your Accounts table
  // Note: Your RLS policies will require the user to be logged in to fetch this data.
  const { data: account, error: accountError } = await supabase
    .from("Accounts")
    .select("id, fullName, avatarURL, role, course, studentID, year")
    .eq("id", user.id) 
    .maybeSingle();

  if (accountError) {
    console.error("⚠️ Error fetching account info:", accountError.message);
  }

  // 3. Merge both auth + Accounts data
  const fullUser: FullUser = {
    id: user.id,
    email: user.email, 
    fullName: account?.fullName ?? "",
    avatarURL: account?.avatarURL ?? "",
    role: account?.role ?? "",
    course: account?.course ?? "",
    studentID: account?.studentID ?? "",
    year: account?.year ?? "",
  };

  return fullUser;
}

/**
 * Utility to consistently determine the user_a_id and user_b_id pair for Conversation lookups.
 * The IDs are sorted alphabetically to ensure a unique, consistent conversation key.
 */
export function getSortedUserPair(currentUserId: string, targetUserId: string) {
  const sortedIds = [currentUserId, targetUserId].sort();
  const id1 = sortedIds[0];
  const id2 = sortedIds[1];

  return {
    user_a_id: id1,
    user_b_id: id2,
    isCurrentUserA: id1 === currentUserId,
  };
}

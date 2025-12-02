import { supabase } from "./supabaseClient";
import type { User } from "./user";

export async function getCurrentUserDetails(): Promise<User | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("❌ No user found or not logged in.");
    return null;
  }

  // Added 'location' to select
  const { data: account, error: accountError } = await supabase
    .from("Accounts")
    .select("id, fullName, avatarURL, coverURL, bio, location, role, course, studentID, year")
    .eq("id", user.id)
    .maybeSingle();

  if (accountError) {
    console.error("⚠️ Error fetching account info:", accountError.message);
  }

  const fullUser: User = { 
    id: user.id,
    email: user.email,
    fullName: account?.fullName ?? "",
    avatarURL: account?.avatarURL ?? "",
    coverURL: account?.coverURL ?? "",
    bio: account?.bio ?? "",
    location: account?.location ?? "", 
    role: account?.role ?? "",
    course: account?.course ?? "",
    studentID: account?.studentID ?? "",
    year: account?.year ?? "",
  };

  return fullUser;
}
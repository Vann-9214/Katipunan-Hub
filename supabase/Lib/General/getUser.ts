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

  console.log("🟩 Auth user fetched:", user.email, user.id);

  const { data: account, error: accountError } = await supabase
    .from("Accounts")
    .select("id, fullName, avatarURL, role, course, studentID, year")
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
    role: account?.role ?? "",
    course: account?.course ?? "",
    studentID: account?.studentID ?? "",
    year: account?.year ?? "",
  };

  console.log("✅ Full merged user:", fullUser);
  return fullUser;
}
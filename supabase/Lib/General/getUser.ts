// lib/user.ts (or wherever you created this file)
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// ✅ Create and EXPORT the client
export const supabase = createClientComponentClient();

export async function getCurrentUserDetails() {
  // ✅ Get the authenticated user from Supabase auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("❌ No user found or not logged in.");
    return null;
  }

  console.log("🟩 Auth user fetched:", user.email, user.id);

  // ✅ Fetch additional details from your Accounts table
  const { data: account, error: accountError } = await supabase
    .from("Accounts")
    .select("id, fullName, avatarURL, role, course, studentID, year")
    .eq("id", user.id)
    .maybeSingle(); // Using maybeSingle() as you did

  if (accountError) {
    console.error("⚠️ Error fetching account info:", accountError.message);
  }

  // ✅ Merge both auth + Accounts data
  const fullUser = {
    id: user.id,
    email: user.email, // comes from auth
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
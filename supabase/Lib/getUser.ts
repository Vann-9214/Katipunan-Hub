import { supabase } from "./supabaseClient";

// Basic: only auth info
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error fetching user:", error.message);
    return null;
  }

  return user;
}

// Extended: with Account table details
export async function getCurrentUserDetails() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("❌ No user found or not logged in.");
    return null;
  }

  // Fetch all account columns you need
  const { data: account, error: accountError } = await supabase
    .from("Accounts")
    .select("id, fullName, avatarURL, role, course, studentID, year")
    .eq("id", user.id)
    .single();

  if (accountError) {
    console.error("⚠️ Error fetching account info:", accountError.message);
    return {
      id: user.id,
      email: user.email,
      fullName: "",
      avatarURL: "",
      role: "",
      course: "",
      studentID: "",
      year: "",
    };
  }

  // ✅ Merge both (auth + table)
  const fullUser = {
    id: user.id,
    email: user.email,
    fullName: account?.fullName || "",
    avatarURL: account?.avatarURL || "",
    role: account?.role || "",
    course: account?.course || "",
    studentID: account?.studentID || "",
    year: account?.year || "",
  };

  console.log("🟩 Full user object:", fullUser);
  return fullUser;
}

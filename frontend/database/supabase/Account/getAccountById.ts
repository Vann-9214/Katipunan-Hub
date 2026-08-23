import { supabase } from "../General/supabaseClient";
import type { User } from "../General/user";

export async function getAccountById(
  userId: string
): Promise<{ data: User | null; error: any }> {
  const { data: account, error } = await supabase
    .from("Accounts")
    .select(
      "id, fullName, avatarURL, coverURL, bio, location, role, course, studentID, year, email"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !account) {
    return { data: null, error };
  }

  const user: User = {
    id: account.id,
    email: account.email || "",
    fullName: account.fullName,
    avatarURL: account.avatarURL,
    coverURL: account.coverURL,
    bio: account.bio,
    location: account.location,
    role: account.role,
    course: account.course,
    studentID: account.studentID,
    year: account.year,
  };

  return { data: user, error: null };
}

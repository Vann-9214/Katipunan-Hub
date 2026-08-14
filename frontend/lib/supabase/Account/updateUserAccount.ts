import { supabase } from "../General/supabaseClient";

// Updated interface to allow nulls
interface UpdateData {
  fullName?: string;
  avatarURL?: string | null; // Allow null
  coverURL?: string | null;  // Allow null
  bio?: string;
  location?: string;
}

export const updateUserAccount = async (
  userId: string,
  updatedData: UpdateData
) => {
  const { data, error } = await supabase
    .from("Accounts")
    .update(updatedData)
    .eq("id", userId)
    .select();

  if (error) {
    console.error("Error updating user account:", error.message);
  }

  return { data, error };
};
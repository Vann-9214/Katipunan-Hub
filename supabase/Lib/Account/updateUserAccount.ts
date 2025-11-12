import { supabase } from "../General/supabaseClient";

// 1. UPDATE THE INTERFACE to accept more fields
interface UpdateData {
  fullName?: string;
  avatarURL?: string; // <-- ADD THIS LINE
}

export const updateUserAccount = async (
  userId: string,
  updatedData: UpdateData
) => {
  // 2. The 'updatedData' object will now automatically handle
  //    whatever fields you pass it (e.g., { fullName: '...' } or { avatarURL: '...' })
  const { data, error } = await supabase
    .from("Accounts")
    .update(updatedData) // <-- Pass the whole object
    .eq("id", userId)
    .select(); // We keep the select for debugging

  console.log("--- FULL SUPABASE UPDATE RESPONSE ---");
  console.log("Data returned:", data);
  console.log("Error returned:", error);
  console.log("-------------------------------------");

  if (error) {
    console.error("Error updating user account:", error.message);
  }

  return { data, error };
};
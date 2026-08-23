import { supabase } from "../General/supabaseClient";

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error logging out:", error.message);
  }
  return { error };
}

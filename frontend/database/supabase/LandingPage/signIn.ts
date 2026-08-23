import { supabase } from "../General/supabaseClient";

export interface SignInCredentials {
  email: string;
  password: string;
}

export async function signIn({ email, password }: SignInCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

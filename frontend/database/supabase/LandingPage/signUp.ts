import { supabase } from "../General/supabaseClient";

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  studentID: string;
  course: string;
  year: string;
  emailRedirectTo?: string;
}

export async function signUp({
  email,
  password,
  fullName,
  studentID,
  course,
  year,
  emailRedirectTo,
}: SignUpParams) {
  const redirectTo =
    emailRedirectTo ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : undefined);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        fullName,
        studentID,
        course,
        year,
        role: "Student",
      },
    },
  });

  return { data, error };
}

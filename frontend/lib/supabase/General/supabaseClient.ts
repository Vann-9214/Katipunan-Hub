// lib/supabaseClient.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// This is now your ONE AND ONLY Supabase client for "use client" components.
// We export it so other files can import it.
export const supabase = createClientComponentClient();
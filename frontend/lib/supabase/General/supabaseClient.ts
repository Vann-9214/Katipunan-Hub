import { createBrowserClient } from "@supabase/ssr";

// This is now your ONE AND ONLY Supabase client for "use client" components.
// We export it so other files can import it.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
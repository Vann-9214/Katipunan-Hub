import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a Supabase client for middleware
  const supabase = createMiddlewareClient({ req, res });

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If there's no session AND the user is trying to access a protected page
  if (!session) {
    // Redirect them to the sign-in page, but keep their intended URL
    // so we can send them back after they log in.
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/signin"; // <-- Your sign-in page
    redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
    
    return NextResponse.redirect(redirectUrl);
  }

  // If they are logged in, let them proceed
  return res;
}

// 3. Configure the "matcher"
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - signin (your sign-in page)
     * - signup (your sign-up page)
     * - / (your public landing page)
     * - .svg (all svg image files)
     * - auth/callback (The verification route - ADDED THIS)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|signin|signup|auth/callback|AboutUs|Features|.*\\.svg$|$).*)",
  ],
};
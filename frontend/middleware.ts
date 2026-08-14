import type { NextRequest } from "next/server";
import { authMiddleware } from "./middlewares/authMiddleware";

export async function middleware(req: NextRequest) {
  return await authMiddleware(req);
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
    "/((?!api|_next/static|_next/image|favicon.ico|signin|signup|auth/callback|AboutUs|Features|.*\\.svg$|.*\\.jpg$|$).*)",
  ],
};
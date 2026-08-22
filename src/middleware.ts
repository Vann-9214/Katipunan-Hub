import { NextResponse } from "next/server";

export async function middleware() {
  // Pure UI Mode: allow direct access to all pages without authentication
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
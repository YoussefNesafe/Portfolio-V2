import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is an admin route (except login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    // Get session token from cookies
    const sessionToken = request.cookies.get("session")?.value;

    // If no session cookie, redirect to login
    // Full session validation happens in API routes (Node.js runtime)
    // Middleware only does a lightweight presence check (Edge Runtime compatible)
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Pass session token via header for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-session-token", sessionToken);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

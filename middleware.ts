import { NextRequest, NextResponse } from "next/server";

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "on");
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  return response;
}

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

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    return addSecurityHeaders(response);
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: ["/admin/:path*"],
};

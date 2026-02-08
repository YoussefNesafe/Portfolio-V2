import { NextRequest, NextResponse } from "next/server";
import { invalidateSession } from "@/app/lib/auth";

// POST /api/auth/logout - Logout endpoint
export async function POST(request: NextRequest) {
  try {
    // Get session token from cookies
    const sessionToken = request.cookies.get("session")?.value;

    // Invalidate session
    if (sessionToken) {
      invalidateSession(sessionToken);
    }

    // Create response
    const response = NextResponse.json(
      { message: "Logout successful" },
      { status: 200 },
    );

    // Clear session cookie
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Delete cookie
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[POST /api/auth/logout]", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/app/lib/auth";

// GET /api/auth/me - Get current user
export async function GET(request: NextRequest) {
  try {
    // Get session token from cookies
    const sessionToken = request.cookies.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Validate session
    const session = validateSession(sessionToken);

    if (!session) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    return NextResponse.json(
      {
        user: {
          id: session.userId,
          name: session.userName,
          email: session.email,
          role: session.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[GET /api/auth/me]", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

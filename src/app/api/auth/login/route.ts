import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { verifyPassword, createSession } from "@/app/lib/auth";

// POST /api/auth/login - Login endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Find admin user
    const adminUser = await db.adminUser.findUnique({
      where: { email },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, adminUser.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Create session
    const sessionToken = await createSession(
      adminUser.id,
      adminUser.name,
      adminUser.email,
      adminUser.role,
    );

    // Create response
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
        },
      },
      { status: 200 },
    );

    // Set session cookie (HTTP-only, secure in production)
    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}

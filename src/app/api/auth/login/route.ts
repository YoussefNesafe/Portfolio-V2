import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { verifyPassword, createSession } from "@/app/lib/auth";
import { loginSchema } from "@/app/lib/schemas";

// Rate limiting: 5 attempts per 15 minutes per IP
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_TRACKED_IPS = 10_000;

function getRateLimitKey(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of loginAttempts) {
    if (now > entry.resetAt) {
      loginAttempts.delete(key);
    }
  }
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    // Prevent unbounded growth
    if (loginAttempts.size >= MAX_TRACKED_IPS) {
      cleanupExpiredEntries();
    }
    loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_ATTEMPTS;
}

// POST /api/auth/login - Login endpoint
export async function POST(request: NextRequest) {
  try {
    const ip = getRateLimitKey(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { email, password } = parsed.data;

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
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}

import { db } from "@/app/lib/db";
import { generateSessionToken } from "./auth-crypto";
import { SESSION_DURATION_MS } from "./constants";

export interface SessionData {
  userId: string;
  userName: string;
  email: string;
  role: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Create a new session (persisted in PostgreSQL)
 */
export async function createSession(
  userId: string,
  userName: string,
  email: string,
  role: string,
): Promise<string> {
  const token = await generateSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

  await db.session.create({
    data: {
      token,
      userId,
      userName,
      email,
      role,
      createdAt: now,
      expiresAt,
    },
  });

  // Clean up expired sessions (fire-and-forget)
  db.session.deleteMany({ where: { expiresAt: { lt: now } } }).catch((err) => console.error("Session cleanup failed:", err));

  return token;
}

/**
 * Validate a session token
 */
export async function validateSession(token: string): Promise<SessionData | null> {
  const session = await db.session.findUnique({ where: { token } });

  if (!session) {
    return null;
  }

  // Check if session has expired
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { token } });
    return null;
  }

  return {
    userId: session.userId,
    userName: session.userName,
    email: session.email,
    role: session.role,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
  };
}

/**
 * Invalidate a session (logout)
 */
export async function invalidateSession(token: string): Promise<void> {
  await db.session.deleteMany({ where: { token } });
}

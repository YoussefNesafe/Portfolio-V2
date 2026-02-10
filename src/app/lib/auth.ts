import { db } from "@/app/lib/db";

/**
 * Hash a password using PBKDF2
 */
export async function hashPassword(password: string): Promise<string> {
  const { randomBytes, pbkdf2Sync } = await import("crypto");
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha256").toString(
    "hex"
  );
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const { pbkdf2Sync } = await import("crypto");
  const [salt, hashFromDb] = hash.split(":");
  const computedHash = pbkdf2Sync(password, salt, 100000, 64, "sha256").toString(
    "hex"
  );
  return computedHash === hashFromDb;
}

/**
 * Generate a secure session token
 */
export async function generateSessionToken(): Promise<string> {
  const { randomBytes } = await import("crypto");
  return randomBytes(32).toString("hex");
}

// Session data structure
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
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

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
  db.session.deleteMany({ where: { expiresAt: { lt: now } } }).catch(() => {});

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

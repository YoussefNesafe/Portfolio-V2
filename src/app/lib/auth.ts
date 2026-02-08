
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

/**
 * Create a session store in memory (could be replaced with Redis or database in production)
 * For now, we'll store sessions in the database
 */

// Session data structure
export interface SessionData {
  userId: string;
  userName: string;
  email: string;
  role: string;
  createdAt: Date;
  expiresAt: Date;
}

// Store sessions in memory (with expiration)
// In production, use Redis or database for persistence across server restarts
const sessionStore = new Map<string, SessionData>();

/**
 * Create a new session
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

  sessionStore.set(token, {
    userId,
    userName,
    email,
    role,
    createdAt: now,
    expiresAt,
  });

  return token;
}

/**
 * Validate a session token
 */
export function validateSession(token: string): SessionData | null {
  const session = sessionStore.get(token);

  if (!session) {
    return null;
  }

  // Check if session has expired
  if (session.expiresAt < new Date()) {
    sessionStore.delete(token);
    return null;
  }

  return session;
}

/**
 * Invalidate a session (logout)
 */
export function invalidateSession(token: string): void {
  sessionStore.delete(token);
}

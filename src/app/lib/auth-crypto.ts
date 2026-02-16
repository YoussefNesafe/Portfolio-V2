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
  const { pbkdf2Sync, timingSafeEqual } = await import("crypto");
  const parts = hash.split(":");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return false;
  }
  const [salt, hashFromDb] = parts;
  const computedHash = pbkdf2Sync(password, salt, 100000, 64, "sha256").toString(
    "hex"
  );
  const hashBuffer = Buffer.from(hashFromDb, "hex");
  const computedBuffer = Buffer.from(computedHash, "hex");
  if (hashBuffer.length !== computedBuffer.length) {
    return false;
  }
  return timingSafeEqual(hashBuffer, computedBuffer);
}

/**
 * Generate a secure session token
 */
export async function generateSessionToken(): Promise<string> {
  const { randomBytes } = await import("crypto");
  return randomBytes(32).toString("hex");
}

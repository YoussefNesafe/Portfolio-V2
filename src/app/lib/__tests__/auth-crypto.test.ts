import { hashPassword, verifyPassword, generateSessionToken } from "../auth-crypto";

describe("hashPassword", () => {
  it("returns salt:hash format", async () => {
    const hash = await hashPassword("password");
    const parts = hash.split(":");
    expect(parts).toHaveLength(2);
    expect(parts[0]).toHaveLength(32); // 16 bytes hex
    expect(parts[1]).toHaveLength(128); // 64 bytes hex
  });

  it("produces different hashes for same password (random salt)", async () => {
    const hash1 = await hashPassword("password");
    const hash2 = await hashPassword("password");
    expect(hash1).not.toBe(hash2);
  });
});

describe("verifyPassword", () => {
  it("returns true for correct password", async () => {
    const hash = await hashPassword("mypassword");
    const result = await verifyPassword("mypassword", hash);
    expect(result).toBe(true);
  });

  it("returns false for wrong password", async () => {
    const hash = await hashPassword("mypassword");
    const result = await verifyPassword("wrongpassword", hash);
    expect(result).toBe(false);
  });

  it("returns false for malformed hash (no colon)", async () => {
    const result = await verifyPassword("password", "nocolonhere");
    expect(result).toBe(false);
  });

  it("returns false for malformed hash (empty parts)", async () => {
    const result = await verifyPassword("password", ":");
    expect(result).toBe(false);
  });
});

describe("generateSessionToken", () => {
  it("returns a 64-character hex string", async () => {
    const token = await generateSessionToken();
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[0-9a-f]+$/);
  });

  it("generates unique tokens", async () => {
    const token1 = await generateSessionToken();
    const token2 = await generateSessionToken();
    expect(token1).not.toBe(token2);
  });
});

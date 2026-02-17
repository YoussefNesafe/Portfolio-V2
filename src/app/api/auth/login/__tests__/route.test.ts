import { NextRequest } from "next/server";

vi.mock("@/app/lib/db", () => ({
  db: {
    adminUser: { findUnique: vi.fn() },
  },
}));

vi.mock("@/app/lib/auth", () => ({
  verifyPassword: vi.fn(),
  createSession: vi.fn(),
  validateSession: vi.fn(),
}));

import { POST } from "../route";
import { db } from "@/app/lib/db";
import { verifyPassword, createSession } from "@/app/lib/auth";

const mockFindUnique = vi.mocked(db.adminUser.findUnique);
const mockVerifyPassword = vi.mocked(verifyPassword);
const mockCreateSession = vi.mocked(createSession);

function loginRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 for missing email", async () => {
    const res = await POST(loginRequest({ password: "pass" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid email", async () => {
    const res = await POST(loginRequest({ email: "bad", password: "pass" }));
    expect(res.status).toBe(400);
  });

  it("returns 401 when user not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    const res = await POST(loginRequest({ email: "a@b.com", password: "pass" }));
    expect(res.status).toBe(401);
  });

  it("returns 401 for wrong password", async () => {
    mockFindUnique.mockResolvedValue({
      id: "1", name: "Admin", email: "a@b.com", password: "hash", role: "admin", createdAt: new Date(),
    });
    mockVerifyPassword.mockResolvedValue(false);
    const res = await POST(loginRequest({ email: "a@b.com", password: "wrong" }));
    expect(res.status).toBe(401);
  });

  it("returns 200 with cookie on success", async () => {
    mockFindUnique.mockResolvedValue({
      id: "1", name: "Admin", email: "a@b.com", password: "hash", role: "admin", createdAt: new Date(),
    });
    mockVerifyPassword.mockResolvedValue(true);
    mockCreateSession.mockResolvedValue("session-token-123");

    const res = await POST(loginRequest({ email: "a@b.com", password: "pass" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe("Login successful");
    expect(data.user.email).toBe("a@b.com");

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("session=session-token-123");
  });

  it("returns 429 after exceeding rate limit", async () => {
    // Need fresh module for rate limiting state
    vi.resetModules();

    // Re-mock dependencies
    vi.doMock("@/app/lib/db", () => ({
      db: { adminUser: { findUnique: vi.fn().mockResolvedValue(null) } },
    }));
    vi.doMock("@/app/lib/auth", () => ({
      verifyPassword: vi.fn(),
      createSession: vi.fn(),
      validateSession: vi.fn(),
    }));

    const { POST: freshPOST } = await import("../route");

    // Make 6 requests from same IP (limit is 5)
    for (let i = 0; i < 5; i++) {
      await freshPOST(
        loginRequest({ email: "a@b.com", password: "p" }, { "x-forwarded-for": "1.2.3.4" }),
      );
    }

    const res = await freshPOST(
      loginRequest({ email: "a@b.com", password: "p" }, { "x-forwarded-for": "1.2.3.4" }),
    );
    expect(res.status).toBe(429);
  });
});

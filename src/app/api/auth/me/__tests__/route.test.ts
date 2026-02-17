import { NextRequest } from "next/server";

vi.mock("@/app/lib/auth", () => ({
  validateSession: vi.fn(),
}));

import { GET } from "../route";
import { validateSession } from "@/app/lib/auth";

const mockValidateSession = vi.mocked(validateSession);

describe("GET /api/auth/me", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when no session cookie", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/me");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Not authenticated");
  });

  it("returns 401 when session is expired/invalid", async () => {
    mockValidateSession.mockResolvedValue(null);
    const req = new NextRequest("http://localhost:3000/api/auth/me");
    req.cookies.set("session", "expired-token");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Session expired");
  });

  it("returns 200 with user data for valid session", async () => {
    mockValidateSession.mockResolvedValue({
      userId: "1",
      userName: "Admin",
      email: "a@b.com",
      role: "admin",
      createdAt: new Date(),
      expiresAt: new Date(),
    });
    const req = new NextRequest("http://localhost:3000/api/auth/me");
    req.cookies.set("session", "valid-token");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user).toEqual({
      id: "1",
      name: "Admin",
      email: "a@b.com",
      role: "admin",
    });
  });
});

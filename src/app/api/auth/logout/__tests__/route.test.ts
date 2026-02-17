import { NextRequest } from "next/server";

vi.mock("@/app/lib/auth", () => ({
  invalidateSession: vi.fn(),
}));

import { POST } from "../route";
import { invalidateSession } from "@/app/lib/auth";

const mockInvalidateSession = vi.mocked(invalidateSession);

describe("POST /api/auth/logout", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 and clears cookie", async () => {
    mockInvalidateSession.mockResolvedValue(undefined);
    const req = new NextRequest("http://localhost:3000/api/auth/logout", {
      method: "POST",
    });
    req.cookies.set("session", "tok123");

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe("Logout successful");
    expect(mockInvalidateSession).toHaveBeenCalledWith("tok123");

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("session=");
    expect(setCookie).toContain("Max-Age=0");
  });

  it("succeeds even without session cookie", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/logout", {
      method: "POST",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockInvalidateSession).not.toHaveBeenCalled();
  });
});

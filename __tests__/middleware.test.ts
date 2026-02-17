import { NextRequest } from "next/server";
import { middleware } from "../middleware";

function createRequest(path: string, options: { cookies?: Record<string, string> } = {}) {
  const url = `http://localhost:3000${path}`;
  const req = new NextRequest(url);
  if (options.cookies) {
    for (const [key, value] of Object.entries(options.cookies)) {
      req.cookies.set(key, value);
    }
  }
  return req;
}

describe("middleware", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe("security headers", () => {
    it("sets security headers on all responses", () => {
      const req = createRequest("/admin/dashboard", { cookies: { session: "tok" } });
      const res = middleware(req);
      expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(res.headers.get("X-Frame-Options")).toBe("DENY");
      expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
      expect(res.headers.get("X-DNS-Prefetch-Control")).toBe("on");
    });

    it("sets HSTS in production", () => {
      process.env.NODE_ENV = "production";
      const req = createRequest("/admin/dashboard", { cookies: { session: "tok" } });
      const res = middleware(req);
      expect(res.headers.get("Strict-Transport-Security")).toBe(
        "max-age=31536000; includeSubDomains",
      );
    });

    it("does not set HSTS in development", () => {
      process.env.NODE_ENV = "development";
      const req = createRequest("/admin/dashboard", { cookies: { session: "tok" } });
      const res = middleware(req);
      expect(res.headers.get("Strict-Transport-Security")).toBeNull();
    });
  });

  describe("admin route protection", () => {
    it("redirects to login when no session cookie", () => {
      const req = createRequest("/admin/dashboard");
      const res = middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/admin/login");
    });

    it("does not redirect /admin/login", () => {
      const req = createRequest("/admin/login");
      const res = middleware(req);
      expect(res.status).not.toBe(307);
    });

    it("passes through with session cookie and sets x-session-token header", () => {
      const req = createRequest("/admin/posts", { cookies: { session: "my-token" } });
      const res = middleware(req);
      expect(res.status).not.toBe(307);
      // Next.js encodes forwarded request headers as x-middleware-request-*
      expect(res.headers.get("x-middleware-request-x-session-token")).toBe("my-token");
    });
  });
});

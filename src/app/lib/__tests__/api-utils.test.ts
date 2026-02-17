import { NextRequest } from "next/server";

vi.mock("@/app/lib/auth", () => ({
  validateSession: vi.fn(),
}));

// Must import after mock
import { requireAuth, requireJson, isPrismaUniqueError, errorResponse, successResponse, withAuth } from "../api-utils";
import { validateSession } from "@/app/lib/auth";
import { Prisma } from "@prisma/client";

const mockValidateSession = vi.mocked(validateSession);

function createRequest(options: {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
} = {}) {
  const url = options.url || "http://localhost:3000/api/test";
  const req = new NextRequest(url, {
    method: options.method || "GET",
    headers: options.headers,
  });
  if (options.cookies) {
    for (const [key, value] of Object.entries(options.cookies)) {
      req.cookies.set(key, value);
    }
  }
  return req;
}

describe("requireJson", () => {
  it("returns null when content-type is application/json", () => {
    const req = createRequest({ headers: { "content-type": "application/json" } });
    expect(requireJson(req)).toBeNull();
  });

  it("returns 415 when content-type is missing", () => {
    const req = createRequest();
    const res = requireJson(req)!;
    expect(res.status).toBe(415);
  });

  it("returns 415 when content-type is wrong", () => {
    const req = createRequest({ headers: { "content-type": "text/plain" } });
    const res = requireJson(req)!;
    expect(res.status).toBe(415);
  });
});

describe("isPrismaUniqueError", () => {
  it("returns true for P2002 error", () => {
    const error = new Prisma.PrismaClientKnownRequestError("Unique constraint", {
      code: "P2002",
      clientVersion: "5.0.0",
    });
    expect(isPrismaUniqueError(error)).toBe(true);
  });

  it("returns false for other Prisma error codes", () => {
    const error = new Prisma.PrismaClientKnownRequestError("Not found", {
      code: "P2025",
      clientVersion: "5.0.0",
    });
    expect(isPrismaUniqueError(error)).toBe(false);
  });

  it("returns false for non-Prisma errors", () => {
    expect(isPrismaUniqueError(new Error("oops"))).toBe(false);
    expect(isPrismaUniqueError(null)).toBe(false);
  });
});

describe("errorResponse", () => {
  it("wraps string in error key", async () => {
    const res = errorResponse("Bad request");
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Bad request" });
  });

  it("uses custom status code", async () => {
    const res = errorResponse("Not found", 404);
    expect(res.status).toBe(404);
  });

  it("passes object body directly", async () => {
    const body = { error: "Validation", details: ["a"] };
    const res = errorResponse(body, 422);
    expect(await res.json()).toEqual(body);
  });
});

describe("successResponse", () => {
  it("returns data with 200 by default", async () => {
    const res = successResponse({ ok: true });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("uses custom status code", async () => {
    const res = successResponse({ id: "1" }, 201);
    expect(res.status).toBe(201);
  });
});

describe("requireAuth", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null when no session cookie", async () => {
    const req = createRequest();
    const result = await requireAuth(req);
    expect(result).toBeNull();
    expect(mockValidateSession).not.toHaveBeenCalled();
  });

  it("delegates to validateSession with cookie value", async () => {
    const sessionData = { userId: "1", userName: "admin", email: "a@b.com", role: "admin", createdAt: new Date(), expiresAt: new Date() };
    mockValidateSession.mockResolvedValue(sessionData);
    const req = createRequest({ cookies: { session: "tok123" } });
    const result = await requireAuth(req);
    expect(mockValidateSession).toHaveBeenCalledWith("tok123");
    expect(result).toEqual(sessionData);
  });
});

describe("withAuth", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockValidateSession.mockResolvedValue(null);
    const handler = vi.fn();
    const wrapped = withAuth(handler);
    const req = createRequest();
    const res = await wrapped(req);
    expect(res.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it("passes session to handler when authenticated", async () => {
    const sessionData = { userId: "1", userName: "admin", email: "a@b.com", role: "admin", createdAt: new Date(), expiresAt: new Date() };
    mockValidateSession.mockResolvedValue(sessionData);
    const handler = vi.fn().mockResolvedValue(new Response("ok"));
    const wrapped = withAuth(handler);
    const req = createRequest({ cookies: { session: "tok" } });
    await wrapped(req);
    expect(handler).toHaveBeenCalledWith(req, sessionData, undefined);
  });
});

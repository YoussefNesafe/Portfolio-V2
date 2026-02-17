import { NextRequest } from "next/server";

vi.mock("@/app/lib/db", () => ({
  db: {
    post: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/app/lib/auth", () => ({
  validateSession: vi.fn(),
}));

import { GET, PUT, DELETE } from "@/app/api/blog/[id]/route";
import { db } from "@/app/lib/db";
import { validateSession } from "@/app/lib/auth";

const mockFindUnique = vi.mocked(db.post.findUnique);
const mockDelete = vi.mocked(db.post.delete);
const mockValidateSession = vi.mocked(validateSession);

const params = (id: string) => ({ params: Promise.resolve({ id }) });

const sessionData = {
  userId: "1", userName: "Admin", email: "a@b.com", role: "admin",
  createdAt: new Date(), expiresAt: new Date(),
};

function jsonRequest(url: string, method: string, body?: unknown) {
  const opts: RequestInit = { method, headers: { "content-type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const req = new NextRequest(url, opts);
  req.cookies.set("session", "tok");
  return req;
}

describe("GET /api/blog/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 404 when post not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    const req = new NextRequest("http://localhost:3000/api/blog/x");
    const res = await GET(req, params("x"));
    expect(res.status).toBe(404);
  });

  it("returns 404 for unpublished post when unauthenticated", async () => {
    mockValidateSession.mockResolvedValue(null);
    mockFindUnique.mockResolvedValue({ id: "1", published: false } as never);
    const req = new NextRequest("http://localhost:3000/api/blog/1");
    const res = await GET(req, params("1"));
    expect(res.status).toBe(404);
  });

  it("returns 200 for published post", async () => {
    mockValidateSession.mockResolvedValue(null);
    mockFindUnique.mockResolvedValue({ id: "1", published: true, title: "Hi" } as never);
    const req = new NextRequest("http://localhost:3000/api/blog/1");
    const res = await GET(req, params("1"));
    expect(res.status).toBe(200);
  });

  it("returns 200 for unpublished post when authenticated", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    mockFindUnique.mockResolvedValue({ id: "1", published: false, title: "Draft" } as never);
    const req = new NextRequest("http://localhost:3000/api/blog/1");
    req.cookies.set("session", "tok");
    const res = await GET(req, params("1"));
    expect(res.status).toBe(200);
  });
});

describe("PUT /api/blog/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockValidateSession.mockResolvedValue(null);
    const req = jsonRequest("http://localhost:3000/api/blog/1", "PUT", { title: "New" });
    const res = await PUT(req, params("1"));
    expect(res.status).toBe(401);
  });

  it("returns 400 for validation failure", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    const req = jsonRequest("http://localhost:3000/api/blog/1", "PUT", { title: "" });
    const res = await PUT(req, params("1"));
    expect(res.status).toBe(400);
  });

  it("returns 404 when post not found", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    vi.mocked(db.$transaction).mockImplementation(async (fn) => {
      const tx = {
        post: {
          findUnique: vi.fn().mockResolvedValue(null),
          update: vi.fn(),
        },
      };
      return fn(tx as never);
    });
    const req = jsonRequest("http://localhost:3000/api/blog/1", "PUT", { title: "New" });
    const res = await PUT(req, params("1"));
    expect(res.status).toBe(404);
  });

  it("returns 200 on successful update", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    const updatedPost = { id: "1", title: "Updated", slug: "updated" };
    vi.mocked(db.$transaction).mockImplementation(async (fn) => {
      const tx = {
        post: {
          findUnique: vi.fn()
            .mockResolvedValueOnce({ id: "1", title: "Old", slug: "old" })
            .mockResolvedValue(null),
          update: vi.fn().mockResolvedValue(updatedPost),
        },
      };
      return fn(tx as never);
    });
    const req = jsonRequest("http://localhost:3000/api/blog/1", "PUT", { title: "Updated" });
    const res = await PUT(req, params("1"));
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/blog/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockValidateSession.mockResolvedValue(null);
    const req = new NextRequest("http://localhost:3000/api/blog/1", { method: "DELETE" });
    const res = await DELETE(req, params("1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when post not found", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    mockFindUnique.mockResolvedValue(null);
    const req = new NextRequest("http://localhost:3000/api/blog/1", { method: "DELETE" });
    req.cookies.set("session", "tok");
    const res = await DELETE(req, params("1"));
    expect(res.status).toBe(404);
  });

  it("returns 200 on successful deletion", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    mockFindUnique.mockResolvedValue({ id: "1", slug: "my-post" } as never);
    mockDelete.mockResolvedValue({ id: "1" } as never);
    const req = new NextRequest("http://localhost:3000/api/blog/1", { method: "DELETE" });
    req.cookies.set("session", "tok");
    const res = await DELETE(req, params("1"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe("Post deleted successfully");
  });
});

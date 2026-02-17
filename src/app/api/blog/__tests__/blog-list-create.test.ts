import { NextRequest } from "next/server";

vi.mock("@/app/lib/db", () => ({
  db: {
    post: { count: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    author: { findFirst: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/app/lib/auth", () => ({
  validateSession: vi.fn(),
}));

import { GET, POST } from "../route";
import { db } from "@/app/lib/db";
import { validateSession } from "@/app/lib/auth";

const mockCount = vi.mocked(db.post.count);
const mockFindMany = vi.mocked(db.post.findMany);
const mockValidateSession = vi.mocked(validateSession);

describe("GET /api/blog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when search query exceeds max length", async () => {
    const longSearch = "a".repeat(201);
    const req = new NextRequest(`http://localhost:3000/api/blog?search=${longSearch}`);
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 with posts and pagination", async () => {
    mockCount.mockResolvedValue(25);
    mockFindMany.mockResolvedValue([{ id: "1" }] as never);

    const req = new NextRequest("http://localhost:3000/api/blog?page=2&limit=10");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.posts).toHaveLength(1);
    expect(data.pagination).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPrevPage: true,
    });
  });
});

describe("POST /api/blog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockValidateSession.mockResolvedValue(null);
    const req = new NextRequest("http://localhost:3000/api/blog", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "T", description: "D", content: "C" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 415 when content-type is wrong", async () => {
    mockValidateSession.mockResolvedValue({
      userId: "1", userName: "Admin", email: "a@b.com", role: "admin",
      createdAt: new Date(), expiresAt: new Date(),
    });
    const req = new NextRequest("http://localhost:3000/api/blog", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "hello",
    });
    req.cookies.set("session", "tok");
    const res = await POST(req);
    expect(res.status).toBe(415);
  });

  it("returns 400 when validation fails", async () => {
    mockValidateSession.mockResolvedValue({
      userId: "1", userName: "Admin", email: "a@b.com", role: "admin",
      createdAt: new Date(), expiresAt: new Date(),
    });
    const req = new NextRequest("http://localhost:3000/api/blog", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "" }),
    });
    req.cookies.set("session", "tok");
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 201 on successful creation", async () => {
    mockValidateSession.mockResolvedValue({
      userId: "1", userName: "Admin", email: "a@b.com", role: "admin",
      createdAt: new Date(), expiresAt: new Date(),
    });

    const createdPost = { id: "new-1", title: "New Post", slug: "new-post" };
    vi.mocked(db.$transaction).mockImplementation(async (fn) => {
      const tx = {
        post: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue(createdPost),
        },
        author: { findFirst: vi.fn().mockResolvedValue({ id: "author-1" }) },
      };
      return fn(tx as never);
    });

    const req = new NextRequest("http://localhost:3000/api/blog", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "New Post", description: "Desc", content: "Body" }),
    });
    req.cookies.set("session", "tok");
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});

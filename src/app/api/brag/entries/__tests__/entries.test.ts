import { NextRequest } from "next/server";

vi.mock("@/app/lib/db", () => ({
  db: {
    bragEntry: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    bragCategory: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/app/lib/auth", () => ({
  validateSession: vi.fn(),
}));

import { GET, POST } from "../route";
import { GET as GET_ID, PUT, DELETE } from "../[id]/route";
import { db } from "@/app/lib/db";
import { validateSession } from "@/app/lib/auth";

const mockEntry = vi.mocked(db.bragEntry);
const mockCategory = vi.mocked(db.bragCategory);
const mockValidateSession = vi.mocked(validateSession);

const params = (id: string) => ({ params: Promise.resolve({ id }) });

const sessionData = {
  userId: "1", userName: "Admin", email: "a@b.com", role: "admin",
  createdAt: new Date(), expiresAt: new Date(),
};

const sampleEntry = {
  id: "e1",
  title: "Shipped auth",
  description: "Built auth system",
  impact: "Secure logins",
  date: new Date("2026-02-10"),
  published: true,
  pinned: false,
  categoryId: "c1",
  category: { id: "c1", name: "Projects", slug: "projects", color: "#06B6D4", sortOrder: 0, createdAt: new Date() },
  createdAt: new Date(),
  updatedAt: new Date(),
};

function jsonReq(url: string, method: string, body?: unknown) {
  const req = new NextRequest(url, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  req.cookies.set("session", "tok");
  return req;
}

// ---------------------------------------------------------------------------
// GET /api/brag/entries
// ---------------------------------------------------------------------------
describe("GET /api/brag/entries", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with paginated entries for unauthenticated user", async () => {
    mockValidateSession.mockResolvedValue(null);
    mockEntry.count.mockResolvedValue(1);
    mockEntry.findMany.mockResolvedValue([sampleEntry] as never);

    const req = new NextRequest("http://localhost:3000/api/brag/entries");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.entries).toHaveLength(1);
    expect(data.pagination.total).toBe(1);
  });

  it("filters by category slug", async () => {
    mockValidateSession.mockResolvedValue(null);
    mockEntry.count.mockResolvedValue(0);
    mockEntry.findMany.mockResolvedValue([] as never);

    const req = new NextRequest("http://localhost:3000/api/brag/entries?category=projects");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(mockEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: { slug: "projects" } }),
      }),
    );
  });

  it("filters by year and month", async () => {
    mockValidateSession.mockResolvedValue(null);
    mockEntry.count.mockResolvedValue(0);
    mockEntry.findMany.mockResolvedValue([] as never);

    const req = new NextRequest("http://localhost:3000/api/brag/entries?year=2026&month=2");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(mockEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ date: expect.objectContaining({ gte: expect.any(Date) }) }),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// POST /api/brag/entries
// ---------------------------------------------------------------------------
describe("POST /api/brag/entries", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockValidateSession.mockResolvedValue(null);
    const req = jsonReq("http://localhost:3000/api/brag/entries", "POST", {
      title: "T", description: "D", categoryId: "c1", date: new Date().toISOString(),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 415 when content-type is wrong", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    const req = new NextRequest("http://localhost:3000/api/brag/entries", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "hello",
    });
    req.cookies.set("session", "tok");
    const res = await POST(req);
    expect(res.status).toBe(415);
  });

  it("returns 400 when validation fails", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    const req = jsonReq("http://localhost:3000/api/brag/entries", "POST", { title: "" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when category not found", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    mockCategory.findUnique.mockResolvedValue(null);
    const req = jsonReq("http://localhost:3000/api/brag/entries", "POST", {
      title: "T", description: "D", categoryId: "bad-id", date: "2026-02-10T00:00:00.000Z",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/category/i);
  });

  it("returns 201 on successful creation", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    mockCategory.findUnique.mockResolvedValue({ id: "c1", name: "Projects" } as never);
    mockEntry.create.mockResolvedValue(sampleEntry as never);

    const req = jsonReq("http://localhost:3000/api/brag/entries", "POST", {
      title: "Shipped auth", description: "Built auth system",
      categoryId: "c1", date: "2026-02-10T00:00:00.000Z",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});

// ---------------------------------------------------------------------------
// GET /api/brag/entries/[id]
// ---------------------------------------------------------------------------
describe("GET /api/brag/entries/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 404 when entry not found", async () => {
    mockEntry.findUnique.mockResolvedValue(null);
    const req = new NextRequest("http://localhost:3000/api/brag/entries/x");
    const res = await GET_ID(req, params("x"));
    expect(res.status).toBe(404);
  });

  it("returns 404 for unpublished entry when unauthenticated", async () => {
    mockValidateSession.mockResolvedValue(null);
    mockEntry.findUnique.mockResolvedValue({ ...sampleEntry, published: false } as never);
    const req = new NextRequest("http://localhost:3000/api/brag/entries/e1");
    const res = await GET_ID(req, params("e1"));
    expect(res.status).toBe(404);
  });

  it("returns 200 for published entry", async () => {
    mockValidateSession.mockResolvedValue(null);
    mockEntry.findUnique.mockResolvedValue(sampleEntry as never);
    const req = new NextRequest("http://localhost:3000/api/brag/entries/e1");
    const res = await GET_ID(req, params("e1"));
    expect(res.status).toBe(200);
  });

  it("returns 200 for unpublished entry when admin", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    mockEntry.findUnique.mockResolvedValue({ ...sampleEntry, published: false } as never);
    const req = new NextRequest("http://localhost:3000/api/brag/entries/e1");
    req.cookies.set("session", "tok");
    const res = await GET_ID(req, params("e1"));
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/brag/entries/[id]
// ---------------------------------------------------------------------------
describe("PUT /api/brag/entries/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockValidateSession.mockResolvedValue(null);
    const req = jsonReq("http://localhost:3000/api/brag/entries/e1", "PUT", { title: "New" });
    const res = await PUT(req, params("e1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when entry not found", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    mockEntry.findUnique.mockResolvedValue(null);
    const req = jsonReq("http://localhost:3000/api/brag/entries/e1", "PUT", { title: "New" });
    const res = await PUT(req, params("e1"));
    expect(res.status).toBe(404);
  });

  it("returns 400 when validation fails", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    const req = jsonReq("http://localhost:3000/api/brag/entries/e1", "PUT", { title: "" });
    const res = await PUT(req, params("e1"));
    expect(res.status).toBe(400);
  });

  it("returns 200 on successful update", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    mockEntry.findUnique.mockResolvedValue(sampleEntry as never);
    mockEntry.update.mockResolvedValue({ ...sampleEntry, title: "Updated" } as never);
    const req = jsonReq("http://localhost:3000/api/brag/entries/e1", "PUT", { title: "Updated" });
    const res = await PUT(req, params("e1"));
    expect(res.status).toBe(200);
  });

  it("can toggle published via PUT", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    mockEntry.findUnique.mockResolvedValue(sampleEntry as never);
    mockEntry.update.mockResolvedValue({ ...sampleEntry, published: false } as never);
    const req = jsonReq("http://localhost:3000/api/brag/entries/e1", "PUT", { published: false });
    const res = await PUT(req, params("e1"));
    expect(res.status).toBe(200);
    expect(mockEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ published: false }) }),
    );
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/brag/entries/[id]
// ---------------------------------------------------------------------------
describe("DELETE /api/brag/entries/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockValidateSession.mockResolvedValue(null);
    const req = new NextRequest("http://localhost:3000/api/brag/entries/e1", { method: "DELETE" });
    const res = await DELETE(req, params("e1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when entry not found", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    mockEntry.findUnique.mockResolvedValue(null);
    const req = new NextRequest("http://localhost:3000/api/brag/entries/e1", { method: "DELETE" });
    req.cookies.set("session", "tok");
    const res = await DELETE(req, params("e1"));
    expect(res.status).toBe(404);
  });

  it("returns 200 on successful deletion", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    mockEntry.findUnique.mockResolvedValue(sampleEntry as never);
    mockEntry.delete.mockResolvedValue(sampleEntry as never);
    const req = new NextRequest("http://localhost:3000/api/brag/entries/e1", { method: "DELETE" });
    req.cookies.set("session", "tok");
    const res = await DELETE(req, params("e1"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toMatch(/deleted/i);
  });
});

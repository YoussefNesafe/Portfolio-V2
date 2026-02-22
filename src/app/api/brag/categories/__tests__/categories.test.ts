import { NextRequest } from "next/server";

vi.mock("@/app/lib/db", () => ({
  db: {
    bragCategory: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/app/lib/auth", () => ({
  validateSession: vi.fn(),
}));

import { GET, POST } from "../route";
import { PUT, DELETE } from "../[id]/route";
import { db } from "@/app/lib/db";
import { validateSession } from "@/app/lib/auth";

const mockCategory = vi.mocked(db.bragCategory);
const mockValidateSession = vi.mocked(validateSession);

const params = (id: string) => ({ params: Promise.resolve({ id }) });

const sessionData = {
  userId: "1", userName: "Admin", email: "a@b.com", role: "admin",
  createdAt: new Date(), expiresAt: new Date(),
};

const sampleCategory = {
  id: "c1",
  name: "Projects",
  slug: "projects",
  color: "#06B6D4",
  sortOrder: 0,
  createdAt: new Date(),
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
// GET /api/brag/categories
// ---------------------------------------------------------------------------
describe("GET /api/brag/categories", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with categories list", async () => {
    mockCategory.findMany.mockResolvedValue([
      { ...sampleCategory, _count: { entries: 3 } },
    ] as never);

    const req = new NextRequest("http://localhost:3000/api/brag/categories");
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].entryCount).toBe(3);
    expect(data[0]).not.toHaveProperty("_count");
  });

  it("returns empty array when no categories", async () => {
    mockCategory.findMany.mockResolvedValue([] as never);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// POST /api/brag/categories
// ---------------------------------------------------------------------------
describe("POST /api/brag/categories", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockValidateSession.mockResolvedValue(null);
    const req = jsonReq("http://localhost:3000/api/brag/categories", "POST", { name: "DevOps" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 415 when content-type is wrong", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    const req = new NextRequest("http://localhost:3000/api/brag/categories", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "hello",
    });
    req.cookies.set("session", "tok");
    const res = await POST(req);
    expect(res.status).toBe(415);
  });

  it("returns 400 when name is missing", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    const req = jsonReq("http://localhost:3000/api/brag/categories", "POST", { name: "" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 201 on successful creation", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    mockCategory.create.mockResolvedValue(sampleCategory as never);

    const req = jsonReq("http://localhost:3000/api/brag/categories", "POST", {
      name: "Projects", color: "#06B6D4",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe("Projects");
  });

  it("returns 201 and auto-generates slug from name", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    mockCategory.create.mockResolvedValue({ ...sampleCategory, name: "Bug Fixes", slug: "bug-fixes" } as never);

    const req = jsonReq("http://localhost:3000/api/brag/categories", "POST", { name: "Bug Fixes" });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(mockCategory.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ slug: "bug-fixes" }) }),
    );
  });
});

// ---------------------------------------------------------------------------
// PUT /api/brag/categories/[id]
// ---------------------------------------------------------------------------
describe("PUT /api/brag/categories/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockValidateSession.mockResolvedValue(null);
    const req = jsonReq("http://localhost:3000/api/brag/categories/c1", "PUT", { name: "New" });
    const res = await PUT(req, params("c1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when category not found", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    mockCategory.findUnique.mockResolvedValue(null);
    const req = jsonReq("http://localhost:3000/api/brag/categories/c1", "PUT", { name: "New" });
    const res = await PUT(req, params("c1"));
    expect(res.status).toBe(404);
  });

  it("returns 200 on successful update", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    mockCategory.findUnique.mockResolvedValue(sampleCategory as never);
    mockCategory.update.mockResolvedValue({ ...sampleCategory, name: "Updated" } as never);

    const req = jsonReq("http://localhost:3000/api/brag/categories/c1", "PUT", { name: "Updated" });
    const res = await PUT(req, params("c1"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("Updated");
  });

  it("auto-generates slug when name changes", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    mockCategory.findUnique.mockResolvedValue(sampleCategory as never);
    mockCategory.update.mockResolvedValue({ ...sampleCategory, name: "New Name", slug: "new-name" } as never);

    const req = jsonReq("http://localhost:3000/api/brag/categories/c1", "PUT", { name: "New Name" });
    await PUT(req, params("c1"));
    expect(mockCategory.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ slug: "new-name" }) }),
    );
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/brag/categories/[id]
// ---------------------------------------------------------------------------
describe("DELETE /api/brag/categories/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockValidateSession.mockResolvedValue(null);
    const req = new NextRequest("http://localhost:3000/api/brag/categories/c1", { method: "DELETE" });
    const res = await DELETE(req, params("c1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when category not found", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    mockCategory.findUnique.mockResolvedValue(null);
    const req = new NextRequest("http://localhost:3000/api/brag/categories/c1", { method: "DELETE" });
    req.cookies.set("session", "tok");
    const res = await DELETE(req, params("c1"));
    expect(res.status).toBe(404);
  });

  it("returns 400 when category has entries", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    mockCategory.findUnique.mockResolvedValue({
      ...sampleCategory,
      _count: { entries: 5 },
    } as never);
    const req = new NextRequest("http://localhost:3000/api/brag/categories/c1", { method: "DELETE" });
    req.cookies.set("session", "tok");
    const res = await DELETE(req, params("c1"));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/entries/i);
  });

  it("returns 200 on successful deletion", async () => {
    mockValidateSession.mockResolvedValue(sessionData);
    mockCategory.findUnique.mockResolvedValue({
      ...sampleCategory,
      _count: { entries: 0 },
    } as never);
    mockCategory.delete.mockResolvedValue(sampleCategory as never);

    const req = new NextRequest("http://localhost:3000/api/brag/categories/c1", { method: "DELETE" });
    req.cookies.set("session", "tok");
    const res = await DELETE(req, params("c1"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toMatch(/deleted/i);
  });
});

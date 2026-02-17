import { NextRequest } from "next/server";
import { z } from "zod";

vi.mock("@/app/lib/db", () => ({
  db: {
    category: {
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

import { createListAndCreateHandlers, createUpdateAndDeleteHandlers } from "../crud-route-factory";
import { db } from "@/app/lib/db";
import { validateSession } from "@/app/lib/auth";

const mockValidateSession = vi.mocked(validateSession);
const mockCategory = db.category as Record<string, ReturnType<typeof vi.fn>>;

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
});

const { GET, POST } = createListAndCreateHandlers({
  model: "category",
  entityName: "Category",
  createSchema,
  buildCreateData: (parsed, slug) => ({ name: parsed.name, slug }),
});

const { PUT, DELETE } = createUpdateAndDeleteHandlers({
  model: "category",
  entityName: "Category",
  updateSchema,
  buildUpdateData: (parsed, slug) => ({ ...parsed, slug }),
});

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

describe("createListAndCreateHandlers", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("GET", () => {
    it("returns items for public visitors (filters by published posts)", async () => {
      mockValidateSession.mockResolvedValue(null);
      mockCategory.findMany.mockResolvedValue([
        { id: "1", name: "Tech", _count: { posts: 3 } },
      ]);

      const req = new NextRequest("http://localhost:3000/api/blog/categories");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data[0].postCount).toBe(3);

      // Verify public filter was applied
      expect(mockCategory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { posts: { some: { published: true } } },
        }),
      );
    });

    it("returns all items for admins", async () => {
      mockValidateSession.mockResolvedValue(sessionData);
      mockCategory.findMany.mockResolvedValue([]);

      const req = new NextRequest("http://localhost:3000/api/blog/categories");
      req.cookies.set("session", "tok");
      const res = await GET(req);
      expect(res.status).toBe(200);

      expect(mockCategory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });
  });

  describe("POST", () => {
    it("returns 401 when unauthenticated", async () => {
      mockValidateSession.mockResolvedValue(null);
      const req = jsonRequest("http://localhost:3000/api/blog/categories", "POST", { name: "Tech" });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it("returns 400 for validation failure", async () => {
      mockValidateSession.mockResolvedValue(sessionData);
      const req = jsonRequest("http://localhost:3000/api/blog/categories", "POST", { name: "" });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 when name already exists", async () => {
      mockValidateSession.mockResolvedValue(sessionData);
      mockCategory.findUnique.mockResolvedValueOnce({ id: "existing" }); // name check
      const req = jsonRequest("http://localhost:3000/api/blog/categories", "POST", { name: "Tech" });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("name already exists");
    });

    it("returns 400 when slug already exists", async () => {
      mockValidateSession.mockResolvedValue(sessionData);
      mockCategory.findUnique
        .mockResolvedValueOnce(null)    // name check - ok
        .mockResolvedValueOnce({ id: "existing" }); // slug check - conflict
      const req = jsonRequest("http://localhost:3000/api/blog/categories", "POST", { name: "Tech" });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("slug already exists");
    });

    it("returns 201 on success", async () => {
      mockValidateSession.mockResolvedValue(sessionData);
      mockCategory.findUnique
        .mockResolvedValueOnce(null)  // name check
        .mockResolvedValueOnce(null); // slug check
      mockCategory.create.mockResolvedValue({ id: "new-1", name: "Tech", slug: "tech" });

      const req = jsonRequest("http://localhost:3000/api/blog/categories", "POST", { name: "Tech" });
      const res = await POST(req);
      expect(res.status).toBe(201);
    });
  });
});

describe("createUpdateAndDeleteHandlers", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("PUT", () => {
    it("returns 401 when unauthenticated", async () => {
      mockValidateSession.mockResolvedValue(null);
      const req = jsonRequest("http://localhost:3000/api/blog/categories/1", "PUT", { name: "New" });
      const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
      expect(res.status).toBe(401);
    });

    it("returns 404 when not found", async () => {
      mockValidateSession.mockResolvedValue(sessionData);
      mockCategory.findUnique.mockResolvedValue(null);
      const req = jsonRequest("http://localhost:3000/api/blog/categories/1", "PUT", { name: "New" });
      const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
      expect(res.status).toBe(404);
    });

    it("returns 400 when name conflicts", async () => {
      mockValidateSession.mockResolvedValue(sessionData);
      mockCategory.findUnique
        .mockResolvedValueOnce({ id: "1", name: "Old", slug: "old" }) // existing
        .mockResolvedValueOnce({ id: "2", name: "New" }); // duplicate name
      const req = jsonRequest("http://localhost:3000/api/blog/categories/1", "PUT", { name: "New" });
      const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
      expect(res.status).toBe(400);
    });

    it("returns 200 on success", async () => {
      mockValidateSession.mockResolvedValue(sessionData);
      mockCategory.findUnique
        .mockResolvedValueOnce({ id: "1", name: "Old", slug: "old" }) // existing
        .mockResolvedValueOnce(null); // no name duplicate
      // slug check might also happen - mock returns null for slug findUnique
      mockCategory.findUnique.mockResolvedValueOnce(null);
      mockCategory.update.mockResolvedValue({ id: "1", name: "New", slug: "new" });

      const req = jsonRequest("http://localhost:3000/api/blog/categories/1", "PUT", { name: "New" });
      const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
      expect(res.status).toBe(200);
    });
  });

  describe("DELETE", () => {
    it("returns 401 when unauthenticated", async () => {
      mockValidateSession.mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/blog/categories/1", { method: "DELETE" });
      const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });
      expect(res.status).toBe(401);
    });

    it("returns 404 when not found", async () => {
      mockValidateSession.mockResolvedValue(sessionData);
      mockCategory.findUnique.mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/blog/categories/1", { method: "DELETE" });
      req.cookies.set("session", "tok");
      const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });
      expect(res.status).toBe(404);
    });

    it("returns 200 on success", async () => {
      mockValidateSession.mockResolvedValue(sessionData);
      mockCategory.findUnique.mockResolvedValue({ id: "1", name: "Tech" });
      mockCategory.delete.mockResolvedValue({ id: "1" });
      const req = new NextRequest("http://localhost:3000/api/blog/categories/1", { method: "DELETE" });
      req.cookies.set("session", "tok");
      const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.message).toContain("deleted successfully");
    });
  });
});

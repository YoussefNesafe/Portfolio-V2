import { NextRequest } from "next/server";

vi.mock("@/app/lib/db", () => ({
  db: {
    post: { findMany: vi.fn() },
  },
}));

import { GET } from "../route";
import { db } from "@/app/lib/db";

const mockFindMany = vi.mocked(db.post.findMany);

describe("GET /api/blog/search", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when query is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/blog/search");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when query is empty", async () => {
    const req = new NextRequest("http://localhost:3000/api/blog/search?q=");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when query is whitespace only", async () => {
    const req = new NextRequest("http://localhost:3000/api/blog/search?q=%20%20");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when query exceeds max length", async () => {
    const longQuery = "a".repeat(201);
    const req = new NextRequest(`http://localhost:3000/api/blog/search?q=${longQuery}`);
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 with results for valid query", async () => {
    const mockPosts = [{ id: "1", title: "React Post" }];
    mockFindMany.mockResolvedValue(mockPosts as never);

    const req = new NextRequest("http://localhost:3000/api/blog/search?q=react");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.query).toBe("react");
    expect(data.results).toEqual(mockPosts);
    expect(data.count).toBe(1);
  });
});

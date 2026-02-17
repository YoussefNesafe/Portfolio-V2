import { resolveNewPostSlug, resolveUpdatedPostSlug } from "../resolve-slug";

function createMockTx(slugMap: Record<string, { id: string; slug: string }>) {
  return {
    post: {
      findUnique: vi.fn(({ where }: { where: { slug: string } }) =>
        Promise.resolve(slugMap[where.slug] || null),
      ),
    },
  };
}

describe("resolveNewPostSlug", () => {
  it("uses custom slug when provided", async () => {
    const tx = createMockTx({});
    const result = await resolveNewPostSlug(tx, "My Title", "custom-slug");
    expect(result).toBe("custom-slug");
  });

  it("generates slug from title when no custom slug", async () => {
    const tx = createMockTx({});
    const result = await resolveNewPostSlug(tx, "My Great Post");
    expect(result).toBe("my-great-post");
  });

  it("deduplicates when slug conflicts exist", async () => {
    const tx = createMockTx({
      "my-post": { id: "1", slug: "my-post" },
    });
    const result = await resolveNewPostSlug(tx, "My Post");
    expect(result).toBe("my-post-1");
  });
});

describe("resolveUpdatedPostSlug", () => {
  const existingPost = { title: "Old Title", slug: "old-title" };

  it("returns existing slug when title unchanged and no custom slug", async () => {
    const tx = createMockTx({});
    const result = await resolveUpdatedPostSlug(
      tx, "post-1", existingPost, undefined, undefined,
    );
    expect(result).toBe("old-title");
  });

  it("generates new slug when title changes", async () => {
    const tx = createMockTx({});
    const result = await resolveUpdatedPostSlug(
      tx, "post-1", existingPost, "New Title", undefined,
    );
    expect(result).toBe("new-title");
  });

  it("uses custom slug when provided", async () => {
    const tx = createMockTx({});
    const result = await resolveUpdatedPostSlug(
      tx, "post-1", existingPost, undefined, "custom-slug",
    );
    expect(result).toBe("custom-slug");
  });

  it("deduplicates when new slug conflicts with another post", async () => {
    const tx = createMockTx({
      "new-title": { id: "other-post", slug: "new-title" },
    });
    const result = await resolveUpdatedPostSlug(
      tx, "post-1", existingPost, "New Title", undefined,
    );
    expect(result).toBe("new-title-1");
  });

  it("allows slug if conflict is the same post", async () => {
    const tx = createMockTx({
      "new-title": { id: "post-1", slug: "new-title" },
    });
    const result = await resolveUpdatedPostSlug(
      tx, "post-1", existingPost, "New Title", undefined,
    );
    expect(result).toBe("new-title");
  });
});

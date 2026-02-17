import { buildPostFilter } from "../build-post-filter";

describe("buildPostFilter", () => {
  it("always includes published: true", () => {
    const filter = buildPostFilter({});
    expect(filter.published).toBe(true);
  });

  it("adds OR clauses for search (title + description by default)", () => {
    const filter = buildPostFilter({ search: "react" });
    expect(filter.OR).toHaveLength(2);
    expect(filter.OR![0]).toEqual({
      title: { contains: "react", mode: "insensitive" },
    });
    expect(filter.OR![1]).toEqual({
      description: { contains: "react", mode: "insensitive" },
    });
  });

  it("includes content in OR when includeContent is true", () => {
    const filter = buildPostFilter({ search: "react" }, { includeContent: true });
    expect(filter.OR).toHaveLength(3);
    expect(filter.OR![2]).toEqual({
      content: { contains: "react", mode: "insensitive" },
    });
  });

  it("filters by category IDs (CSV splitting)", () => {
    const filter = buildPostFilter({ category: "cat1,cat2" });
    expect(filter.categories).toEqual({
      some: { id: { in: ["cat1", "cat2"] } },
    });
  });

  it("filters by tag IDs (CSV splitting)", () => {
    const filter = buildPostFilter({ tag: "tag1,tag2" });
    expect(filter.tags).toEqual({
      some: { id: { in: ["tag1", "tag2"] } },
    });
  });

  it("ignores empty category string", () => {
    const filter = buildPostFilter({ category: "" });
    expect(filter.categories).toBeUndefined();
  });

  it("ignores empty tag string", () => {
    const filter = buildPostFilter({ tag: "" });
    expect(filter.tags).toBeUndefined();
  });

  it("does not add OR when search is empty", () => {
    const filter = buildPostFilter({ search: "" });
    expect(filter.OR).toBeUndefined();
  });
});

import { slugify, generateUniqueSlug } from "../slugify";

describe("slugify", () => {
  it("converts to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("trims whitespace", () => {
    expect(slugify("  hello  ")).toBe("hello");
  });

  it("replaces special characters with nothing", () => {
    expect(slugify("hello!@#$%world")).toBe("helloworld");
  });

  it("replaces spaces and underscores with hyphens", () => {
    expect(slugify("hello world_foo")).toBe("hello-world-foo");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("hello---world")).toBe("hello-world");
  });

  it("strips leading and trailing hyphens", () => {
    expect(slugify("-hello-world-")).toBe("hello-world");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

describe("generateUniqueSlug", () => {
  it("returns baseSlug when it matches existingSlug", async () => {
    const result = await generateUniqueSlug("my-slug", "my-slug");
    expect(result).toBe("my-slug");
  });

  it("returns baseSlug when no checkFn provided", async () => {
    const result = await generateUniqueSlug("my-slug");
    expect(result).toBe("my-slug");
  });

  it("returns baseSlug when checkFn returns false (no conflict)", async () => {
    const checkFn = vi.fn().mockResolvedValue(false);
    const result = await generateUniqueSlug("my-slug", undefined, checkFn);
    expect(result).toBe("my-slug");
  });

  it("appends counter when conflicts exist", async () => {
    const checkFn = vi
      .fn()
      .mockResolvedValueOnce(true) // "my-slug" taken
      .mockResolvedValueOnce(true) // "my-slug-1" taken
      .mockResolvedValueOnce(false); // "my-slug-2" free
    const result = await generateUniqueSlug("my-slug", undefined, checkFn);
    expect(result).toBe("my-slug-2");
  });

  it("throws after 100 attempts", async () => {
    const checkFn = vi.fn().mockResolvedValue(true);
    await expect(
      generateUniqueSlug("slug", undefined, checkFn),
    ).rejects.toThrow("Cannot generate unique slug");
  });
});

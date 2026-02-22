import {
  loginSchema,
  createPostSchema,
  updatePostSchema,
  createCategorySchema,
  updateCategorySchema,
  createTagSchema,
  updateTagSchema,
  createBragCategorySchema,
  updateBragCategorySchema,
  createBragEntrySchema,
  updateBragEntrySchema,
} from "../schemas";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "pass" });
    expect(result.success).toBe(true);
  });

  it("rejects missing email", () => {
    const result = loginSchema.safeParse({ password: "pass" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-email", password: "pass" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("createPostSchema", () => {
  const validPost = {
    title: "Hello",
    description: "Desc",
    content: "Body",
  };

  it("accepts valid post", () => {
    expect(createPostSchema.safeParse(validPost).success).toBe(true);
  });

  it("rejects missing title", () => {
    expect(createPostSchema.safeParse({ ...validPost, title: "" }).success).toBe(false);
  });

  it("rejects content over 100k chars", () => {
    const result = createPostSchema.safeParse({
      ...validPost,
      content: "x".repeat(100_001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid slug", () => {
    const result = createPostSchema.safeParse({ ...validPost, slug: "hello-world" });
    expect(result.success).toBe(true);
  });

  it("rejects slug with uppercase", () => {
    const result = createPostSchema.safeParse({ ...validPost, slug: "Hello-World" });
    expect(result.success).toBe(false);
  });

  it("rejects slug with spaces", () => {
    const result = createPostSchema.safeParse({ ...validPost, slug: "hello world" });
    expect(result.success).toBe(false);
  });
});

describe("updatePostSchema", () => {
  it("accepts empty object (all optional)", () => {
    expect(updatePostSchema.safeParse({}).success).toBe(true);
  });

  it("accepts partial update", () => {
    expect(updatePostSchema.safeParse({ title: "New" }).success).toBe(true);
  });

  it("accepts published boolean", () => {
    expect(updatePostSchema.safeParse({ published: true }).success).toBe(true);
  });

  it("accepts nullable publishedAt", () => {
    expect(updatePostSchema.safeParse({ publishedAt: null }).success).toBe(true);
  });
});

describe("createCategorySchema", () => {
  it("accepts valid category", () => {
    expect(createCategorySchema.safeParse({ name: "Tech" }).success).toBe(true);
  });

  it("rejects empty name", () => {
    expect(createCategorySchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("accepts optional description", () => {
    expect(
      createCategorySchema.safeParse({ name: "Tech", description: "desc" }).success,
    ).toBe(true);
  });
});

describe("updateCategorySchema", () => {
  it("accepts empty object", () => {
    expect(updateCategorySchema.safeParse({}).success).toBe(true);
  });

  it("accepts name update", () => {
    expect(updateCategorySchema.safeParse({ name: "New" }).success).toBe(true);
  });
});

describe("createTagSchema", () => {
  it("accepts valid tag", () => {
    expect(createTagSchema.safeParse({ name: "react" }).success).toBe(true);
  });

  it("rejects empty name", () => {
    expect(createTagSchema.safeParse({ name: "" }).success).toBe(false);
  });
});

describe("updateTagSchema", () => {
  it("accepts empty object", () => {
    expect(updateTagSchema.safeParse({}).success).toBe(true);
  });

  it("accepts slug update", () => {
    expect(updateTagSchema.safeParse({ slug: "my-tag" }).success).toBe(true);
  });
});

describe("createBragCategorySchema", () => {
  it("accepts valid category with name only", () => {
    expect(createBragCategorySchema.safeParse({ name: "Projects" }).success).toBe(true);
  });

  it("rejects empty name", () => {
    expect(createBragCategorySchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("accepts valid hex color", () => {
    expect(
      createBragCategorySchema.safeParse({ name: "Projects", color: "#06B6D4" }).success,
    ).toBe(true);
  });

  it("rejects invalid hex color", () => {
    expect(
      createBragCategorySchema.safeParse({ name: "Projects", color: "not-a-color" }).success,
    ).toBe(false);
  });

  it("rejects short hex color", () => {
    expect(
      createBragCategorySchema.safeParse({ name: "Projects", color: "#06B" }).success,
    ).toBe(false);
  });

  it("accepts sortOrder as non-negative integer", () => {
    expect(
      createBragCategorySchema.safeParse({ name: "Projects", sortOrder: 3 }).success,
    ).toBe(true);
  });

  it("accepts custom slug", () => {
    expect(
      createBragCategorySchema.safeParse({ name: "Projects", slug: "my-projects" }).success,
    ).toBe(true);
  });
});

describe("updateBragCategorySchema", () => {
  it("accepts empty object (all optional)", () => {
    expect(updateBragCategorySchema.safeParse({}).success).toBe(true);
  });

  it("accepts name update only", () => {
    expect(updateBragCategorySchema.safeParse({ name: "New Name" }).success).toBe(true);
  });

  it("accepts color update only", () => {
    expect(updateBragCategorySchema.safeParse({ color: "#A855F7" }).success).toBe(true);
  });

  it("rejects invalid hex color on update", () => {
    expect(updateBragCategorySchema.safeParse({ color: "purple" }).success).toBe(false);
  });
});

describe("createBragEntrySchema", () => {
  const validEntry = {
    title: "Shipped auth system",
    description: "Built full auth with sessions",
    categoryId: "c1",
    date: "2026-02-10T00:00:00.000Z",
  };

  it("accepts valid entry", () => {
    expect(createBragEntrySchema.safeParse(validEntry).success).toBe(true);
  });

  it("rejects empty title", () => {
    expect(createBragEntrySchema.safeParse({ ...validEntry, title: "" }).success).toBe(false);
  });

  it("rejects empty description", () => {
    expect(createBragEntrySchema.safeParse({ ...validEntry, description: "" }).success).toBe(false);
  });

  it("rejects missing categoryId", () => {
    expect(
      createBragEntrySchema.safeParse({ ...validEntry, categoryId: "" }).success,
    ).toBe(false);
  });

  it("rejects invalid date string", () => {
    expect(
      createBragEntrySchema.safeParse({ ...validEntry, date: "not-a-date" }).success,
    ).toBe(false);
  });

  it("rejects non-ISO date string", () => {
    expect(
      createBragEntrySchema.safeParse({ ...validEntry, date: "2026-02-10" }).success,
    ).toBe(false);
  });

  it("accepts optional impact", () => {
    expect(
      createBragEntrySchema.safeParse({ ...validEntry, impact: "Improved security" }).success,
    ).toBe(true);
  });

  it("rejects impact over 500 chars", () => {
    expect(
      createBragEntrySchema.safeParse({ ...validEntry, impact: "x".repeat(501) }).success,
    ).toBe(false);
  });

  it("accepts published boolean", () => {
    expect(createBragEntrySchema.safeParse({ ...validEntry, published: true }).success).toBe(true);
  });

  it("accepts pinned boolean", () => {
    expect(createBragEntrySchema.safeParse({ ...validEntry, pinned: false }).success).toBe(true);
  });

  it("rejects description over 5000 chars", () => {
    expect(
      createBragEntrySchema.safeParse({ ...validEntry, description: "x".repeat(5001) }).success,
    ).toBe(false);
  });
});

describe("updateBragEntrySchema", () => {
  it("accepts empty object (all optional)", () => {
    expect(updateBragEntrySchema.safeParse({}).success).toBe(true);
  });

  it("accepts title update only", () => {
    expect(updateBragEntrySchema.safeParse({ title: "New title" }).success).toBe(true);
  });

  it("accepts published toggle", () => {
    expect(updateBragEntrySchema.safeParse({ published: false }).success).toBe(true);
  });

  it("accepts pinned toggle", () => {
    expect(updateBragEntrySchema.safeParse({ pinned: true }).success).toBe(true);
  });

  it("rejects empty title on update", () => {
    expect(updateBragEntrySchema.safeParse({ title: "" }).success).toBe(false);
  });

  it("rejects invalid date on update", () => {
    expect(updateBragEntrySchema.safeParse({ date: "bad-date" }).success).toBe(false);
  });

  it("accepts valid ISO date on update", () => {
    expect(
      updateBragEntrySchema.safeParse({ date: "2026-01-15T00:00:00.000Z" }).success,
    ).toBe(true);
  });
});

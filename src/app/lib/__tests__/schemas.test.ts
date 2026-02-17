import {
  loginSchema,
  createPostSchema,
  updatePostSchema,
  createCategorySchema,
  updateCategorySchema,
  createTagSchema,
  updateTagSchema,
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

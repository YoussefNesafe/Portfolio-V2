import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugField = z.string().regex(slugPattern, "Slug must be lowercase alphanumeric with hyphens only").optional();

// --- Auth ---
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// --- Blog Post ---
export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  content: z.string().min(1, "Content is required").max(100_000, "Content too long (max 100,000 characters)"),
  slug: slugField,
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  coverImage: z.string().nullable().optional(),
  excerpt: z.string().optional(),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  content: z.string().min(1).max(100_000, "Content too long (max 100,000 characters)").optional(),
  slug: slugField,
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  coverImage: z.string().nullable().optional(),
  excerpt: z.string().optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
});

// --- Category ---
export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().nullable().optional(),
  slug: slugField,
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  slug: slugField,
});

// --- Tag ---
export const createTagSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  slug: slugField,
});

export const updateTagSchema = z.object({
  name: z.string().min(1).optional(),
  slug: slugField,
});

// --- Brag Category ---
export const createBragCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").optional(),
  sortOrder: z.number().int().min(0).optional(),
  slug: slugField,
});

export const updateBragCategorySchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").optional(),
  sortOrder: z.number().int().min(0).optional(),
  slug: slugField,
});

// --- Brag Entry ---
export const createBragEntrySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required").max(5000, "Description too long"),
  categoryId: z.string().min(1, "Category is required"),
  date: z.string().datetime({ message: "Must be a valid ISO date" }),
  impact: z.string().max(500).optional(),
  published: z.boolean().optional(),
  pinned: z.boolean().optional(),
});

export const updateBragEntrySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).max(5000).optional(),
  categoryId: z.string().min(1).optional(),
  date: z.string().datetime().optional(),
  impact: z.string().max(500).nullable().optional(),
  published: z.boolean().optional(),
  pinned: z.boolean().optional(),
});
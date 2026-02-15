import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { slugify } from "@/app/utils/slugify";
import { requireAuth, requireJson, isPrismaUniqueError } from "@/app/lib/api-utils";
import { createCategorySchema } from "@/app/lib/schemas";

// GET /api/blog/categories - List all categories
export async function GET(_request: NextRequest) {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // Map to include post count in response
    const categoriesWithCount = categories.map(({ _count, ...rest }) => ({
      ...rest,
      postCount: _count.posts,
    }));

    return NextResponse.json(categoriesWithCount, { status: 200 });
  } catch (error) {
    console.error("[GET /api/blog/categories]", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

// POST /api/blog/categories - Create a category (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await requireAuth(request);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const jsonError = requireJson(request);
    if (jsonError) return jsonError;

    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { name, description, slug: customSlug } = parsed.data;

    // Check if category already exists
    const existingCategory = await db.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 },
      );
    }

    const slug = customSlug || slugify(name);

    // Check if slug is unique
    const existingSlug = await db.category.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 400 },
      );
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        description: description || null,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (isPrismaUniqueError(error)) {
      return NextResponse.json(
        { error: "Name already exists" },
        { status: 400 },
      );
    }
    console.error("[POST /api/blog/categories]", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}

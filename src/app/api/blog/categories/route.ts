import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { slugify } from "@/app/utils/slugify";
import { validateSession } from "@/app/lib/auth";

// GET /api/blog/categories - List all categories
export async function GET(request: NextRequest) {
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
    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      postCount: cat._count.posts,
      _count: undefined,
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
    const sessionToken = request.cookies.get("session")?.value;
    if (!sessionToken || !validateSession(sessionToken)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, slug: customSlug } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 },
      );
    }

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

    const category = await db.category.create({
      data: {
        name,
        slug,
        description: description || null,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("[POST /api/blog/categories]", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}

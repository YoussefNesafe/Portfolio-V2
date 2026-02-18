import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { requireAuth, requireJson, isPrismaUniqueError } from "@/app/lib/api-utils";
import { createBragCategorySchema } from "@/app/lib/schemas";
import { slugify } from "@/app/utils/slugify";

// GET /api/brag/categories - List all brag categories
export async function GET() {
  try {
    const categories = await db.bragCategory.findMany({
      include: { _count: { select: { entries: true } } },
      orderBy: { sortOrder: "asc" },
    });

    const data = categories.map(({ _count, ...rest }) => ({
      ...rest,
      entryCount: _count.entries,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/brag/categories]", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST /api/brag/categories - Create a brag category (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jsonError = requireJson(request);
    if (jsonError) return jsonError;

    const body = await request.json();
    const parsed = createBragCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, color, sortOrder, slug: customSlug } = parsed.data;
    const slug = customSlug || slugify(name);

    const category = await db.bragCategory.create({
      data: { name, slug, color: color || null, sortOrder: sortOrder ?? 0 },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (isPrismaUniqueError(error)) {
      return NextResponse.json({ error: "Category name or slug already exists" }, { status: 400 });
    }
    console.error("[POST /api/brag/categories]", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

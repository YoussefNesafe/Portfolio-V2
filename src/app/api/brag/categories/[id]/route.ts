import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { requireAuth, requireJson, isPrismaUniqueError } from "@/app/lib/api-utils";
import { updateBragCategorySchema } from "@/app/lib/schemas";
import { slugify } from "@/app/utils/slugify";

// PUT /api/brag/categories/[id] - Update a brag category (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jsonError = requireJson(request);
    if (jsonError) return jsonError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateBragCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const existing = await db.bragCategory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const { name, color, sortOrder, slug: customSlug } = parsed.data;
    const slug = customSlug || (name ? slugify(name) : undefined);

    const updated = await db.bragCategory.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(color !== undefined && { color }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (isPrismaUniqueError(error)) {
      return NextResponse.json({ error: "Category name or slug already exists" }, { status: 400 });
    }
    console.error("[PUT /api/brag/categories/[id]]", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE /api/brag/categories/[id] - Delete a brag category (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.bragCategory.findUnique({
      where: { id },
      include: { _count: { select: { entries: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    if (existing._count.entries > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with entries. Reassign entries first." },
        { status: 400 },
      );
    }

    await db.bragCategory.delete({ where: { id } });
    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/brag/categories/[id]]", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}

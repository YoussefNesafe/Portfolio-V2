import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { slugify } from "@/app/utils/slugify";
import { validateSession } from "@/app/lib/auth";

interface Params {
  id: string;
}

// PUT /api/blog/categories/[id] - Update a category (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    // Check authentication
    const sessionToken = request.cookies.get("session")?.value;
    if (!sessionToken || !(await validateSession(sessionToken))) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, slug: customSlug } = body;

    // Check if category exists
    const existingCategory = await db.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // Check if new name is unique
    if (name && name !== existingCategory.name) {
      const duplicate = await db.category.findUnique({
        where: { name },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "Category with this name already exists" },
          { status: 400 },
        );
      }
    }

    const slug = customSlug || (name ? slugify(name) : undefined);

    const updatedCategory = await db.category.update({
      where: { id },
      data: {
        name: name || undefined,
        slug: slug || undefined,
        description: description !== undefined ? description : undefined,
      },
    });

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/blog/categories/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 },
    );
  }
}

// DELETE /api/blog/categories/[id] - Delete a category (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    // Check authentication
    const sessionToken = request.cookies.get("session")?.value;
    if (!sessionToken || !(await validateSession(sessionToken))) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if category exists
    const category = await db.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // Delete category (posts are not deleted, just the association)
    await db.category.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("[DELETE /api/blog/categories/[id]]", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
}

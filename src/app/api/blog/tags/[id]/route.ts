import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { slugify } from "@/app/utils/slugify";
import { validateSession } from "@/app/lib/auth";

interface Params {
  id: string;
}

// PUT /api/blog/tags/[id] - Update a tag (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    // Check authentication
    const sessionToken = request.cookies.get("session")?.value;
    if (!sessionToken || !validateSession(sessionToken)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, slug: customSlug } = body;

    // Check if tag exists
    const existingTag = await db.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    // Check if new name is unique
    if (name && name !== existingTag.name) {
      const duplicate = await db.tag.findUnique({
        where: { name },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "Tag with this name already exists" },
          { status: 400 },
        );
      }
    }

    const slug = customSlug || (name ? slugify(name) : undefined);

    const updatedTag = await db.tag.update({
      where: { id },
      data: {
        name: name || undefined,
        slug: slug || undefined,
      },
    });

    return NextResponse.json(updatedTag, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/blog/tags/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update tag" },
      { status: 500 },
    );
  }
}

// DELETE /api/blog/tags/[id] - Delete a tag (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    // Check authentication
    const sessionToken = request.cookies.get("session")?.value;
    if (!sessionToken || !validateSession(sessionToken)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if tag exists
    const tag = await db.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    // Delete tag (posts are not deleted, just the association)
    await db.tag.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Tag deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("[DELETE /api/blog/tags/[id]]", error);
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db";
import { requireAuth, requireJson } from "@/app/lib/api-utils";
import { updateBragEntrySchema } from "@/app/lib/schemas";
import { BRAG_ENTRY_INCLUDE } from "../../helpers/prisma-includes";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/brag/entries/[id] - Get a single entry
export async function GET(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { id } = await params;
    const session = await requireAuth(request);
    const isAdmin = !!session;

    const entry = await db.bragEntry.findUnique({
      where: { id },
      include: BRAG_ENTRY_INCLUDE,
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Non-admin can only see published entries
    if (!isAdmin && !entry.published) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("[GET /api/brag/entries/[id]]", error);
    return NextResponse.json({ error: "Failed to fetch entry" }, { status: 500 });
  }
}

// PUT /api/brag/entries/[id] - Update a brag entry (admin only)
export async function PUT(
  request: NextRequest,
  { params }: RouteParams,
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
    const parsed = updateBragEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const existing = await db.bragEntry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const { title, description, categoryId, date, impact, published, pinned } = parsed.data;

    // Verify category if changing
    if (categoryId && categoryId !== existing.categoryId) {
      const category = await db.bragCategory.findUnique({ where: { id: categoryId } });
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 400 });
      }
    }

    const updated = await db.bragEntry.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(categoryId !== undefined && { categoryId }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(impact !== undefined && { impact }),
        ...(published !== undefined && { published }),
        ...(pinned !== undefined && { pinned }),
      },
      include: BRAG_ENTRY_INCLUDE,
    });

    revalidatePath("/brag");
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/brag/entries/[id]]", error);
    return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
  }
}

// DELETE /api/brag/entries/[id] - Delete a brag entry (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const session = await requireAuth(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.bragEntry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    await db.bragEntry.delete({ where: { id } });

    revalidatePath("/brag");
    return NextResponse.json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/brag/entries/[id]]", error);
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}

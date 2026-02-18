import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db";
import { requireAuth, requireJson } from "@/app/lib/api-utils";
import { createBragEntrySchema } from "@/app/lib/schemas";
import { BRAG_ENTRY_INCLUDE } from "../helpers/prisma-includes";
import { Prisma } from "@prisma/client";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function parsePagination(searchParams: URLSearchParams) {
  let page = parseInt(searchParams.get("page") || "1", 10);
  if (isNaN(page) || page < 1) page = 1;
  let limit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10);
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  limit = Math.min(limit, MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
}

// GET /api/brag/entries - List brag entries with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const session = await requireAuth(request);
    const isAdmin = !!session;

    const { page, limit, skip } = parsePagination(searchParams);

    const where: Prisma.BragEntryWhereInput = {};

    // Public always sees published only
    if (!isAdmin || searchParams.get("published") === "true") {
      where.published = true;
    } else if (searchParams.get("published") === "false") {
      where.published = false;
    }

    // Category filter
    const categorySlug = searchParams.get("category");
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    // Pinned filter
    if (searchParams.get("pinned") === "true") {
      where.pinned = true;
    }

    // Date range filters
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    if (year) {
      const y = parseInt(year, 10);
      if (!isNaN(y)) {
        const startDate = new Date(y, month ? parseInt(month, 10) - 1 : 0, 1);
        const endDate = month
          ? new Date(y, parseInt(month, 10), 1)
          : new Date(y + 1, 0, 1);
        where.date = { gte: startDate, lt: endDate };
      }
    }

    const [entries, total] = await Promise.all([
      db.bragEntry.findMany({
        where,
        include: BRAG_ENTRY_INCLUDE,
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      db.bragEntry.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("[GET /api/brag/entries]", error);
    return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
  }
}

// POST /api/brag/entries - Create a brag entry (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jsonError = requireJson(request);
    if (jsonError) return jsonError;

    const body = await request.json();
    const parsed = createBragEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { title, description, categoryId, date, impact, published, pinned } = parsed.data;

    // Verify category exists
    const category = await db.bragCategory.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }

    const entry = await db.bragEntry.create({
      data: {
        title,
        description,
        categoryId,
        date: new Date(date),
        impact: impact || null,
        published: published ?? false,
        pinned: pinned ?? false,
      },
      include: BRAG_ENTRY_INCLUDE,
    });

    revalidatePath("/brag");
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("[POST /api/brag/entries]", error);
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
  }
}

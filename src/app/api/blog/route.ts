import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db";
import { requireAuth, requireJson } from "@/app/lib/api-utils";
import { createPostSchema } from "@/app/lib/schemas";
import { SEARCH_QUERY_MAX_LENGTH } from "@/app/lib/constants";
import { parsePagination, buildPostFilter, resolveNewPostSlug, POST_INCLUDE_FULL } from "./helpers";

// GET /api/blog - List posts with pagination, filtering, and search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const searchQuery = searchParams.get("search");
    if (searchQuery && searchQuery.length > SEARCH_QUERY_MAX_LENGTH) {
      return NextResponse.json(
        { error: "Search query too long (max 200 characters)" },
        { status: 400 },
      );
    }

    const { page, limit, skip } = parsePagination(searchParams);
    const where = buildPostFilter(
      {
        search: searchParams.get("search") || undefined,
        category: searchParams.get("category") || undefined,
        tag: searchParams.get("tag") || undefined,
      },
      { includeContent: true },
    );

    const total = await db.post.count({ where });

    const posts = await db.post.findMany({
      where,
      include: POST_INCLUDE_FULL,
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[GET /api/blog]", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}

// POST /api/blog - Create a new post (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jsonError = requireJson(request);
    if (jsonError) return jsonError;

    const body = await request.json();
    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const {
      title,
      description,
      content,
      slug: customSlug,
      categoryIds,
      tagIds,
      coverImage,
      excerpt,
    } = parsed.data;

    const post = await db.$transaction(async (tx) => {
      const slug = await resolveNewPostSlug(tx, title, customSlug);

      // Get author (default author for now)
      // TODO: In Phase 3, get author from authenticated user
      const author = await tx.author.findFirst();
      if (!author) {
        throw new Error("NO_AUTHOR");
      }

      return tx.post.create({
        data: {
          title,
          slug,
          description,
          content,
          excerpt: excerpt || description.substring(0, 200),
          coverImage: coverImage || null,
          authorId: author.id,
          categories: categoryIds
            ? {
                connect: categoryIds.map((id: string) => ({ id })),
              }
            : undefined,
          tags: tagIds
            ? {
                connect: tagIds.map((id: string) => ({ id })),
              }
            : undefined,
        },
        include: {
          author: true,
          categories: true,
          tags: true,
        },
      });
    });

    revalidatePath("/blog");
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_AUTHOR") {
      return NextResponse.json(
        { error: "No author found. Run `npm run db:seed` to create the default author." },
        { status: 400 },
      );
    }
    console.error("[POST /api/blog]", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}

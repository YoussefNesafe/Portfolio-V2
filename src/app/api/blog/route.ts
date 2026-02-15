import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db";
import { Prisma } from "@prisma/client";
import { slugify, generateUniqueSlug } from "@/app/utils/slugify";
import { requireAuth, requireJson } from "@/app/lib/api-utils";
import { createPostSchema } from "@/app/lib/schemas";

// GET /api/blog - List posts with pagination, filtering, and search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let page = parseInt(searchParams.get("page") || "1", 10);
    if (isNaN(page) || page < 1) page = 1;
    let limit = parseInt(searchParams.get("limit") || "9", 10);
    if (isNaN(limit) || limit < 1) limit = 9;
    limit = Math.min(limit, 50); // Max 50 per page
    const searchQuery = searchParams.get("search");
    const categoryId = searchParams.get("category");
    const tagId = searchParams.get("tag");

    if (searchQuery && searchQuery.length > 200) {
      return NextResponse.json(
        { error: "Search query too long (max 200 characters)" },
        { status: 400 },
      );
    }

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: Prisma.PostWhereInput = {
      published: true,
    };

    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: "insensitive" } },
        { description: { contains: searchQuery, mode: "insensitive" } },
        { content: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    const categoryIds = categoryId
      ? categoryId.split(",").filter(Boolean)
      : [];
    if (categoryIds.length > 0) {
      where.categories = {
        some: { id: { in: categoryIds } },
      };
    }

    const tagIds = tagId ? tagId.split(",").filter(Boolean) : [];
    if (tagIds.length > 0) {
      where.tags = {
        some: { id: { in: tagIds } },
      };
    }

    // Get total count for pagination
    const total = await db.post.count({ where });

    // Fetch posts
    const posts = await db.post.findMany({
      where,
      include: {
        author: true,
        categories: true,
        tags: true,
      },
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
    // Check authentication
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

    // Create post inside a transaction to prevent slug race conditions
    const post = await db.$transaction(async (tx) => {
      // Generate slug
      let slug = customSlug || slugify(title);

      // Check if slug is unique
      const existingPost = await tx.post.findUnique({
        where: { slug },
      });

      if (existingPost) {
        slug = await generateUniqueSlug(slug, undefined, async (testSlug) => {
          const p = await tx.post.findUnique({
            where: { slug: testSlug },
          });
          return !!p;
        });
      }

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

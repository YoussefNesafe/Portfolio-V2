import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db";
import { slugify, generateUniqueSlug } from "@/app/utils/slugify";
import { validateSession } from "@/app/lib/auth";

// GET /api/blog - List posts with pagination, filtering, and search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "9", 10), 50); // Max 50 per page
    const searchQuery = searchParams.get("search");
    const categoryId = searchParams.get("category");
    const tagId = searchParams.get("tag");

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {
      published: true,
    };

    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: "insensitive" } },
        { description: { contains: searchQuery, mode: "insensitive" } },
        { content: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      where.categories = {
        some: { id: categoryId },
      };
    }

    if (tagId) {
      where.tags = {
        some: { id: tagId },
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
    const sessionToken = request.cookies.get("session")?.value;
    if (!sessionToken || !(await validateSession(sessionToken))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      content,
      slug: customSlug,
      categoryIds,
      tagIds,
      coverImage,
      excerpt,
    } = body;

    // Validation
    if (!title || !description || !content) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, content" },
        { status: 400 },
      );
    }

    // Generate slug
    let slug = customSlug || slugify(title);

    // Check if slug is unique
    const existingPost = await db.post.findUnique({
      where: { slug },
    });

    if (existingPost) {
      slug = await generateUniqueSlug(slug, undefined, async (testSlug) => {
        const post = await db.post.findUnique({
          where: { slug: testSlug },
        });
        return !!post;
      });
    }

    // Create post with author (default author for now)
    // TODO: In Phase 3, get author from authenticated user
    const author = await db.author.findFirst();
    if (!author) {
      return NextResponse.json(
        { error: "No author found. Please seed initial data." },
        { status: 400 },
      );
    }

    const post = await db.post.create({
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

    revalidatePath("/blog");
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("[POST /api/blog]", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}

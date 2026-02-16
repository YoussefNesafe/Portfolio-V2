import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { slugify } from "@/app/utils/slugify";
import { requireAuth, requireJson, isPrismaUniqueError } from "@/app/lib/api-utils";
import { createTagSchema } from "@/app/lib/schemas";

// GET /api/blog/tags - List all tags
export async function GET(_request: NextRequest) {
  try {
    const tags = await db.tag.findMany({
      where: { posts: { some: { published: true } } },
      include: {
        _count: {
          select: { posts: { where: { published: true } } },
        },
      },
      orderBy: { name: "asc" },
    });

    // Map to include post count in response
    const tagsWithCount = tags.map(({ _count, ...rest }) => ({
      ...rest,
      postCount: _count.posts,
    }));

    return NextResponse.json(tagsWithCount, { status: 200 });
  } catch (error) {
    console.error("[GET /api/blog/tags]", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 },
    );
  }
}

// POST /api/blog/tags - Create a tag (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await requireAuth(request);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const jsonError = requireJson(request);
    if (jsonError) return jsonError;

    const body = await request.json();
    const parsed = createTagSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { name, slug: customSlug } = parsed.data;

    // Check if tag already exists
    const existingTag = await db.tag.findUnique({
      where: { name },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "Tag with this name already exists" },
        { status: 400 },
      );
    }

    const slug = customSlug || slugify(name);

    // Check if slug is unique
    const existingSlug = await db.tag.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "A tag with this slug already exists" },
        { status: 400 },
      );
    }

    const tag = await db.tag.create({
      data: {
        name,
        slug,
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    if (isPrismaUniqueError(error)) {
      return NextResponse.json(
        { error: "Name already exists" },
        { status: 400 },
      );
    }
    console.error("[POST /api/blog/tags]", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 },
    );
  }
}

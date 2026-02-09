import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db";
import { slugify, generateUniqueSlug } from "@/app/utils/slugify";
import { validateSession } from "@/app/lib/auth";

interface Params {
  id: string;
}

// GET /api/blog/[id] - Get a single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const { id } = await params;

    const post = await db.post.findUnique({
      where: { id },
      include: {
        author: true,
        categories: true,
        tags: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error("[GET /api/blog/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 },
    );
  }
}

// PUT /api/blog/[id] - Update a post (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    // Check authentication
    const sessionToken = request.cookies.get("session")?.value;
    if (!sessionToken || !validateSession(sessionToken)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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
      published,
      publishedAt,
    } = body;

    // Check if post exists
    const existingPost = await db.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Generate new slug if title changed
    let slug = existingPost.slug;
    if ((title && title !== existingPost.title) || customSlug) {
      slug = customSlug || slugify(title || existingPost.title);

      // Check if new slug is unique
      const slugConflict = await db.post.findUnique({
        where: { slug },
      });

      if (slugConflict && slugConflict.id !== id) {
        slug = await generateUniqueSlug(
          slug,
          existingPost.slug,
          async (testSlug) => {
            const post = await db.post.findUnique({
              where: { slug: testSlug },
            });
            return !!post && post.id !== id;
          },
        );
      }
    }

    // Update post
    const updatedPost = await db.post.update({
      where: { id },
      data: {
        title: title || undefined,
        slug: slug || undefined,
        description: description || undefined,
        content: content || undefined,
        excerpt: excerpt || undefined,
        coverImage: coverImage !== undefined ? coverImage : undefined,
        published: published !== undefined ? published : undefined,
        publishedAt: publishedAt !== undefined ? publishedAt : undefined,
        categories: categoryIds
          ? {
              set: categoryIds.map((cid: string) => ({ id: cid })),
            }
          : undefined,
        tags: tagIds
          ? {
              set: tagIds.map((tid: string) => ({ id: tid })),
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
    revalidatePath(`/blog/${updatedPost.slug}`);
    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/blog/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 },
    );
  }
}

// DELETE /api/blog/[id] - Delete a post (admin only)
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

    // Check if post exists
    const post = await db.post.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Delete post (cascade will handle relations)
    await db.post.delete({
      where: { id },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("[DELETE /api/blog/[id]]", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 },
    );
  }
}

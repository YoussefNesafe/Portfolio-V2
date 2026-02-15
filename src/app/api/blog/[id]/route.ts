import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db";
import { slugify, generateUniqueSlug } from "@/app/utils/slugify";
import { requireAuth, requireJson } from "@/app/lib/api-utils";
import { updatePostSchema } from "@/app/lib/schemas";

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

    // Check if request is from an authenticated admin
    const session = await requireAuth(request);

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

    // Only allow access to unpublished posts for authenticated admins
    if (!post.published && !session) {
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
    const session = await requireAuth(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jsonError = requireJson(request);
    if (jsonError) return jsonError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updatePostSchema.safeParse(body);
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
      published,
      publishedAt,
    } = parsed.data;

    const updatedPost = await db.$transaction(async (tx) => {
      // Check if post exists
      const existingPost = await tx.post.findUnique({
        where: { id },
      });

      if (!existingPost) {
        return null;
      }

      // Generate new slug if title changed
      let slug = existingPost.slug;
      if ((title && title !== existingPost.title) || customSlug) {
        slug = customSlug || slugify(title || existingPost.title);

        // Check if new slug is unique
        const slugConflict = await tx.post.findUnique({
          where: { slug },
        });

        if (slugConflict && slugConflict.id !== id) {
          slug = await generateUniqueSlug(
            slug,
            existingPost.slug,
            async (testSlug) => {
              const post = await tx.post.findUnique({
                where: { slug: testSlug },
              });
              return !!post && post.id !== id;
            },
          );
        }
      }

      // Update post
      return tx.post.update({
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
    });

    if (!updatedPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

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
    const session = await requireAuth(request);
    if (!session) {
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

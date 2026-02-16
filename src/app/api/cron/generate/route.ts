import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { generatePostContent } from "@/app/lib/content-generator";
import { slugify, generateUniqueSlug } from "@/app/utils/slugify";
import { sendLowQueueAlert } from "@/app/lib/email";

export const maxDuration = 60;

function verifyCronSecret(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

async function processQueueItem(queueItem: { id: string; title: string }) {
  // Lock item
  await db.queuedPost.update({
    where: { id: queueItem.id },
    data: { status: "generating" },
  });

  try {
    // Fetch existing categories and tags
    const [categories, tags] = await Promise.all([
      db.category.findMany({ select: { name: true } }),
      db.tag.findMany({ select: { name: true } }),
    ]);

    const generated = await generatePostContent(
      queueItem.title,
      categories.map((c) => c.name),
      tags.map((t) => t.name),
    );

    // Find or create categories
    const categoryIds: string[] = [];
    for (const catName of generated.categoryNames) {
      let category = await db.category.findUnique({ where: { name: catName } });
      if (!category) {
        const slug = await generateUniqueSlug(
          slugify(catName),
          undefined,
          async (s) => !!(await db.category.findUnique({ where: { slug: s } })),
        );
        category = await db.category.create({ data: { name: catName, slug } });
      }
      categoryIds.push(category.id);
    }

    // Find or create tags
    const tagIds: string[] = [];
    for (const tagName of generated.tagNames) {
      let tag = await db.tag.findUnique({ where: { name: tagName } });
      if (!tag) {
        const slug = await generateUniqueSlug(
          slugify(tagName),
          undefined,
          async (s) => !!(await db.tag.findUnique({ where: { slug: s } })),
        );
        tag = await db.tag.create({ data: { name: tagName, slug } });
      }
      tagIds.push(tag.id);
    }

    // Get first author
    const author = await db.author.findFirst();
    if (!author) {
      throw new Error("No author found in database — seed one first");
    }

    // Create post slug
    const postSlug = await generateUniqueSlug(
      slugify(queueItem.title),
      undefined,
      async (s) => !!(await db.post.findUnique({ where: { slug: s } })),
    );

    // Create post (unpublished) and link to queue entry
    const post = await db.post.create({
      data: {
        title: queueItem.title,
        slug: postSlug,
        description: generated.description,
        content: generated.content,
        excerpt: generated.excerpt,
        published: false,
        authorId: author.id,
        categories: { connect: categoryIds.map((id) => ({ id })) },
        tags: { connect: tagIds.map((id) => ({ id })) },
      },
    });

    await db.queuedPost.update({
      where: { id: queueItem.id },
      data: { status: "generated", postId: post.id },
    });

    return post.title;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await db.queuedPost.update({
      where: { id: queueItem.id },
      data: { status: "failed", errorMsg: message },
    });
    throw error;
  }
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  try {
    // Process first pending item
    const pending = await db.queuedPost.findFirst({
      where: { status: "pending" },
      orderBy: { position: "asc" },
    });

    if (pending) {
      const title = await processQueueItem(pending);
      results.push(`Generated: ${title}`);
    }

    // Also retry one failed item
    const failed = await db.queuedPost.findFirst({
      where: { status: "failed" },
      orderBy: { position: "asc" },
    });

    if (failed) {
      try {
        const title = await processQueueItem(failed);
        results.push(`Retried: ${title}`);
      } catch {
        results.push(`Retry failed: ${failed.title}`);
      }
    }

    // Check remaining pending count for low queue alert
    const remainingPending = await db.queuedPost.findMany({
      where: { status: "pending" },
      orderBy: { position: "asc" },
      select: { title: true },
    });

    if (remainingPending.length <= 10 && remainingPending.length > 0) {
      await sendLowQueueAlert(remainingPending.map((p) => p.title));
      results.push(`Low queue alert sent (${remainingPending.length} remaining)`);
    }

    if (results.length === 0) {
      return NextResponse.json({ message: "Nothing to process" });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("[CRON /api/cron/generate]", error);
    return NextResponse.json(
      { error: "Generation failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 },
    );
  }
}

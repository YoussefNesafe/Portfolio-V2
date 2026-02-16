import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const queueItem = await db.queuedPost.findFirst({
      where: { status: "generated" },
      orderBy: { position: "asc" },
      include: { post: true },
    });

    if (!queueItem || !queueItem.post) {
      return NextResponse.json({ message: "Nothing to publish" });
    }

    await db.post.update({
      where: { id: queueItem.post.id },
      data: { published: true, publishedAt: new Date() },
    });

    await db.queuedPost.update({
      where: { id: queueItem.id },
      data: { status: "published" },
    });

    revalidatePath("/blog");

    return NextResponse.json({
      message: `Published: ${queueItem.post.title}`,
      slug: queueItem.post.slug,
    });
  } catch (error) {
    console.error("[CRON /api/cron/publish]", error);
    return NextResponse.json(
      { error: "Publish failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 },
    );
  }
}

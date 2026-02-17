import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { processQueueItem } from "@/app/lib/queue-processor";
import { sendLowQueueAlert } from "@/app/lib/email";

export const maxDuration = 60;

function verifyCronSecret(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
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

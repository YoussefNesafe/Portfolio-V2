import { NextRequest } from "next/server";
import { db } from "@/app/lib/db";
import { processQueueItem } from "@/app/lib/queue-processor";
import { withAuth, errorResponse, successResponse } from "@/app/lib/api-utils";

export const maxDuration = 60;

export const POST = withAuth(async (
  _request: NextRequest,
  _session,
  context,
) => {
  try {
    const { id } = await context!.params;

    const queueItem = await db.queuedPost.findUnique({ where: { id } });
    if (!queueItem) {
      return errorResponse("Queue item not found", 404);
    }

    if (!["pending", "failed"].includes(queueItem.status)) {
      return errorResponse("Can only generate pending or failed items");
    }

    const title = await processQueueItem(queueItem);
    return successResponse({ message: `Generated: ${title}`, title });
  } catch (error) {
    console.error("[POST /api/blog/queue/[id]/generate]", error);
    return errorResponse(
      error instanceof Error ? error.message : "Generation failed",
      500,
    );
  }
});

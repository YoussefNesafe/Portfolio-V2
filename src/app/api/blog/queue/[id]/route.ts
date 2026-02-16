import { NextRequest } from "next/server";
import { db } from "@/app/lib/db";
import { withAuth, requireJson, errorResponse, successResponse } from "@/app/lib/api-utils";
import { updateQueueItemSchema } from "@/app/lib/schemas";

export const PUT = withAuth(async (
  request: NextRequest,
  _session,
  context,
) => {
  try {
    const jsonError = requireJson(request);
    if (jsonError) return jsonError;

    const { id } = await context!.params;
    const body = await request.json();

    const parsed = updateQueueItemSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const existing = await db.queuedPost.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Queue item not found", 404);
    }

    // Only allow editing pending or failed items
    if (!["pending", "failed"].includes(existing.status)) {
      return errorResponse("Can only edit pending or failed items");
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.position !== undefined) data.position = parsed.data.position;
    if (parsed.data.status !== undefined) {
      // Reset status to pending (retry failed item)
      data.status = parsed.data.status;
      data.errorMsg = null;
    }

    const updated = await db.queuedPost.update({ where: { id }, data });
    return successResponse(updated);
  } catch (error) {
    console.error("[PUT /api/blog/queue/[id]]", error);
    return errorResponse("Failed to update queue item", 500);
  }
});

export const DELETE = withAuth(async (
  _request: NextRequest,
  _session,
  context,
) => {
  try {
    const { id } = await context!.params;

    const existing = await db.queuedPost.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Queue item not found", 404);
    }

    if (!["pending", "failed"].includes(existing.status)) {
      return errorResponse("Can only delete pending or failed items");
    }

    await db.queuedPost.delete({ where: { id } });
    return successResponse({ message: "Queue item deleted" });
  } catch (error) {
    console.error("[DELETE /api/blog/queue/[id]]", error);
    return errorResponse("Failed to delete queue item", 500);
  }
});

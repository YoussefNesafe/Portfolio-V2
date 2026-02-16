import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { withAuth, requireJson, errorResponse, successResponse } from "@/app/lib/api-utils";
import { addQueueTitleSchema, addBulkQueueTitlesSchema } from "@/app/lib/schemas";

export const GET = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where = status ? { status } : {};

    const items = await db.queuedPost.findMany({
      where,
      orderBy: { position: "asc" },
      include: { post: { select: { id: true, slug: true, title: true } } },
    });

    return successResponse(items);
  } catch (error) {
    console.error("[GET /api/blog/queue]", error);
    return errorResponse("Failed to fetch queue", 500);
  }
});

export const POST = withAuth(async (request) => {
  try {
    const jsonError = requireJson(request);
    if (jsonError) return jsonError;

    const body = await request.json();

    // Determine if single or bulk add
    const isBulk = "titles" in body;
    const titles: string[] = [];

    if (isBulk) {
      const parsed = addBulkQueueTitlesSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
      }
      titles.push(...parsed.data.titles);
    } else {
      const parsed = addQueueTitleSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
      }
      titles.push(parsed.data.title);
    }

    // Get current max position
    const maxPos = await db.queuedPost.aggregate({ _max: { position: true } });
    let nextPosition = (maxPos._max.position ?? -1) + 1;

    const created = await db.queuedPost.createMany({
      data: titles.map((title) => ({
        title,
        position: nextPosition++,
      })),
    });

    return successResponse({ count: created.count }, 201);
  } catch (error) {
    console.error("[POST /api/blog/queue]", error);
    return errorResponse("Failed to add to queue", 500);
  }
});

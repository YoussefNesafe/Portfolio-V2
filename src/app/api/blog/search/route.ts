import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { POST_INCLUDE_FULL } from "../helpers/prisma-includes";
import { SEARCH_QUERY_MAX_LENGTH, SEARCH_RESULTS_LIMIT } from "@/app/lib/constants";

// GET /api/blog/search - Search posts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 },
      );
    }

    if (query.trim().length > SEARCH_QUERY_MAX_LENGTH) {
      return NextResponse.json(
        { error: "Search query too long (max 200 characters)" },
        { status: 400 },
      );
    }

    const posts = await db.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      },
      include: POST_INCLUDE_FULL,
      orderBy: { publishedAt: "desc" },
      take: SEARCH_RESULTS_LIMIT,
    });

    return NextResponse.json(
      {
        query,
        results: posts,
        count: posts.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[GET /api/blog/search]", error);
    return NextResponse.json(
      { error: "Failed to search posts" },
      { status: 500 },
    );
  }
}

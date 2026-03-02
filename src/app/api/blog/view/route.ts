import { NextRequest, NextResponse } from "next/server";
import { requireJson } from "@/app/lib/api-utils";
import { postViewSchema } from "@/app/lib/schemas";
import { db } from "@/app/lib/db";

export async function POST(request: NextRequest) {
  const contentTypeError = requireJson(request);
  if (contentTypeError) return contentTypeError;

  try {
    const body = await request.json();
    const result = postViewSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ success: false }, { status: 200 });
    }

    const { slug } = result.data;
    await db.post.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}

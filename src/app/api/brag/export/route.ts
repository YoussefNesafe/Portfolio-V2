import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import React, { type JSXElementConstructor, type ReactElement } from "react";
import { db } from "@/app/lib/db";
import { errorResponse } from "@/app/lib/api-utils";
import {
  BRAG_ENTRY_INCLUDE,
  PUBLISHED_BRAG_FILTER,
} from "@/app/api/brag/helpers/prisma-includes";
import { BragPdfDocument } from "./brag-pdf-document";

export const maxDuration = 30;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const format = request.nextUrl.searchParams.get("format");

  if (format !== "json" && format !== "pdf") {
    return errorResponse("format must be 'json' or 'pdf'", 400);
  }

  try {
    const [entries, categories] = await Promise.all([
      db.bragEntry.findMany({
        where: PUBLISHED_BRAG_FILTER,
        include: BRAG_ENTRY_INCLUDE,
        orderBy: { date: "desc" },
      }),
      db.bragCategory.findMany({
        include: {
          _count: { select: { entries: { where: { published: true } } } },
        },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    // ── Meta: streak + this-month count ──────────────────────────────────
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const entriesThisMonth = entries.filter((e) => e.date >= startOfMonth).length;

    // Current streak — consecutive weeks (Sunday-start) with at least one entry
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);

    let currentStreak = 0;
    for (let i = 0; i < 52; i++) {
      const weekStart = new Date(currentWeekStart.getTime() - i * weekMs);
      const weekEnd = new Date(weekStart.getTime() + weekMs);
      const hasEntry = entries.some((e) => e.date >= weekStart && e.date < weekEnd);
      if (hasEntry) {
        currentStreak++;
      } else {
        break;
      }
    }

    const categoriesActive = categories.filter((c) => c._count.entries > 0).length;

    const meta = {
      totalEntries: entries.length,
      entriesThisMonth,
      currentStreak,
      categoriesActive,
    };

    // ── Shape shared data ─────────────────────────────────────────────────
    const shapedCategories = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      color: c.color ?? "#06B6D4",
      sortOrder: c.sortOrder,
      entryCount: c._count.entries,
    }));

    const shapedEntries = entries.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      impact: e.impact,
      date: e.date.toISOString().split("T")[0],
      pinned: e.pinned,
      category: {
        name: e.category.name,
        slug: e.category.slug,
        color: e.category.color ?? "#06B6D4",
      },
      createdAt: e.createdAt.toISOString(),
    }));

    const exportedAt = now.toISOString();

    // ── JSON branch ───────────────────────────────────────────────────────
    if (format === "json") {
      const payload = {
        exportedAt,
        meta,
        categories: shapedCategories,
        entries: shapedEntries,
      };

      return new NextResponse(JSON.stringify(payload, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": 'attachment; filename="brag-report.json"',
        },
      });
    }

    // ── PDF branch ────────────────────────────────────────────────────────
    const element = React.createElement(BragPdfDocument, {
      exportedAt,
      meta,
      categories: shapedCategories,
      entries: shapedEntries,
    }) as unknown as ReactElement<DocumentProps, string | JSXElementConstructor<unknown>>;

    const buffer = await renderToBuffer(element);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="brag-report.pdf"',
      },
    });
  } catch (error) {
    console.error("[GET /api/brag/export]", error);
    return errorResponse("Failed to generate export", 500);
  }
}

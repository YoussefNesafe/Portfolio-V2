import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";

// GET /api/brag/stats - Public dashboard stats
export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    const [
      totalEntries,
      entriesThisMonth,
      categories,
      heatmapEntries,
      monthlyEntries,
      pinnedEntries,
    ] = await Promise.all([
      // Total published entries
      db.bragEntry.count({ where: { published: true } }),

      // Entries this month
      db.bragEntry.count({
        where: { published: true, date: { gte: startOfMonth } },
      }),

      // Category distribution
      db.bragCategory.findMany({
        include: {
          _count: { select: { entries: { where: { published: true } } } },
        },
        orderBy: { sortOrder: "asc" },
      }),

      // Heatmap data: daily counts for past year
      db.bragEntry.findMany({
        where: { published: true, date: { gte: oneYearAgo } },
        select: { date: true },
        orderBy: { date: "asc" },
      }),

      // Monthly trend: entries per month for past 12 months
      db.bragEntry.findMany({
        where: { published: true, date: { gte: oneYearAgo } },
        select: { date: true },
        orderBy: { date: "asc" },
      }),

      // Pinned highlights
      db.bragEntry.findMany({
        where: { published: true, pinned: true },
        include: { category: true },
        orderBy: { date: "desc" },
        take: 5,
      }),
    ]);

    // Build heatmap: aggregate by day
    const heatmapMap = new Map<string, number>();
    for (const entry of heatmapEntries) {
      const key = entry.date.toISOString().split("T")[0];
      heatmapMap.set(key, (heatmapMap.get(key) || 0) + 1);
    }
    const heatmapData = Array.from(heatmapMap.entries()).map(([date, count]) => ({ date, count }));

    // Build monthly trend
    const monthlyMap = new Map<string, number>();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(key, 0);
    }
    for (const entry of monthlyEntries) {
      const key = `${entry.date.getFullYear()}-${String(entry.date.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyMap.has(key)) {
        monthlyMap.set(key, monthlyMap.get(key)! + 1);
      }
    }
    const monthlyTrend = Array.from(monthlyMap.entries()).map(([month, count]) => ({ month, count }));

    // Calculate current streak (consecutive weeks with at least one entry)
    let currentStreak = 0;
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    // Start from current week and go backwards
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);

    for (let i = 0; i < 52; i++) {
      const weekStart = new Date(currentWeekStart.getTime() - i * weekMs);
      const weekEnd = new Date(weekStart.getTime() + weekMs);
      const hasEntry = heatmapEntries.some(
        (e) => e.date >= weekStart && e.date < weekEnd,
      );
      if (hasEntry) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Category distribution (only categories with entries)
    const categoryDistribution = categories
      .filter((c) => c._count.entries > 0)
      .map((c) => ({
        name: c.name,
        slug: c.slug,
        color: c.color || "#06B6D4",
        count: c._count.entries,
      }));

    return NextResponse.json({
      totalEntries,
      entriesThisMonth,
      currentStreak,
      categoriesActive: categoryDistribution.length,
      heatmapData,
      categoryDistribution,
      monthlyTrend,
      pinnedEntries,
    });
  } catch (error) {
    console.error("[GET /api/brag/stats]", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

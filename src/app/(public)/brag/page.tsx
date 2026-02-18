export const revalidate = 3600;

import type { Metadata } from "next";
import { db } from "@/app/lib/db";
import BragDashboard from "./components/BragDashboard";
import type { IBragStats } from "@/app/models/Brag";

export const metadata: Metadata = {
  title: "Work Log",
  description: "A running log of my daily accomplishments, learnings, and highlights.",
};

async function getBragStats(): Promise<IBragStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  const [totalEntries, entriesThisMonth, categories, recentEntries, pinnedEntries] =
    await Promise.all([
      db.bragEntry.count({ where: { published: true } }),
      db.bragEntry.count({ where: { published: true, date: { gte: startOfMonth } } }),
      db.bragCategory.findMany({
        include: { _count: { select: { entries: { where: { published: true } } } } },
        orderBy: { sortOrder: "asc" },
      }),
      db.bragEntry.findMany({
        where: { published: true, date: { gte: oneYearAgo } },
        select: { date: true },
        orderBy: { date: "asc" },
      }),
      db.bragEntry.findMany({
        where: { published: true, pinned: true },
        include: { category: true },
        orderBy: { date: "desc" },
        take: 5,
      }),
    ]);

  // Build heatmap
  const heatmapMap = new Map<string, number>();
  for (const entry of recentEntries) {
    const key = entry.date.toISOString().split("T")[0];
    heatmapMap.set(key, (heatmapMap.get(key) || 0) + 1);
  }
  const heatmapData = Array.from(heatmapMap.entries()).map(([date, count]) => ({ date, count }));

  // Monthly trend
  const monthlyMap = new Map<string, number>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, 0);
  }
  for (const entry of recentEntries) {
    const key = `${entry.date.getFullYear()}-${String(entry.date.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyMap.has(key)) {
      monthlyMap.set(key, monthlyMap.get(key)! + 1);
    }
  }
  const monthlyTrend = Array.from(monthlyMap.entries()).map(([month, count]) => ({ month, count }));

  // Current streak (consecutive weeks with entries)
  let currentStreak = 0;
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
  currentWeekStart.setHours(0, 0, 0, 0);

  for (let i = 0; i < 52; i++) {
    const weekStart = new Date(currentWeekStart.getTime() - i * weekMs);
    const weekEnd = new Date(weekStart.getTime() + weekMs);
    const hasEntry = recentEntries.some((e) => e.date >= weekStart && e.date < weekEnd);
    if (hasEntry) {
      currentStreak++;
    } else {
      break;
    }
  }

  const categoryDistribution = categories
    .filter((c) => c._count.entries > 0)
    .map((c) => ({
      name: c.name,
      slug: c.slug,
      color: c.color || "#06B6D4",
      count: c._count.entries,
    }));

  return {
    totalEntries,
    entriesThisMonth,
    currentStreak,
    categoriesActive: categoryDistribution.length,
    heatmapData,
    categoryDistribution,
    monthlyTrend,
    pinnedEntries: pinnedEntries.map((e) => ({
      ...e,
      date: e.date,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
  };
}

export default async function BragPage() {
  const stats = await getBragStats();

  return (
    <div>
      {/* Hero — matches blog page header spacing */}
      <div className="mb-[8vw] tablet:mb-[4vw] desktop:mb-[2vw] text-center space-y-[2.667vw] tablet:space-y-[1.333vw] desktop:space-y-[0.556vw]">
        <h1 className="text-[8vw] tablet:text-[4vw] desktop:text-[1.667vw] font-bold text-text-heading">
          <span className="gradient-text">Work Log</span>
        </h1>
        <p className="text-text-muted text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.75vw] max-w-[80vw] tablet:max-w-[50vw] desktop:max-w-[31.25vw] mx-auto">
          A running log of my daily accomplishments, learnings, and project highlights —
          inspired by Julia Evans&apos; brag documents.
        </p>
      </div>

      {/* Dashboard */}
      {stats.totalEntries > 0 ? (
        <BragDashboard stats={stats} />
      ) : (
        <div className="text-center py-[13.333vw] tablet:py-[6.667vw] desktop:py-[2.778vw]">
          <p className="text-text-muted text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.75vw]">
            No entries yet. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import type { IBragStats } from "@/app/models/Brag";
import type { IBragStatsDictionary } from "@/app/models/IBragDictionary";
// import BragStatsRow from "./BragStatsRow";
// import ActivityHeatmap from "./ActivityHeatmap";
import CategoryChart from "./CategoryChart";
import MonthlyTrendChart from "./MonthlyTrendChart";
import PinnedHighlights from "./PinnedHighlights";
import BragTimeline from "./BragTimeline";
import BragExportButton from "./BragExportButton";

interface BragDashboardProps {
  stats: IBragStats;
  statsLabels: IBragStatsDictionary;
}

export default function BragDashboard({
  stats,
  // statsLabels,
}: BragDashboardProps) {
  return (
    <div className="space-y-[8vw] tablet:space-y-[4vw] desktop:space-y-[1.667vw]">
      {/* Export row */}
      <div className="flex justify-end">
        <BragExportButton />
      </div>

      {/* Stats Row */}
      {/* <BragStatsRow
        totalEntries={stats.totalEntries}
        entriesThisMonth={stats.entriesThisMonth}
        currentStreak={stats.currentStreak}
        categoriesActive={stats.categoriesActive}
        labels={statsLabels}
      /> */}

      {/* Heatmap */}
      {/* <ActivityHeatmap data={stats.heatmapData} /> */}

      {/* Charts row */}
      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-[4vw] tablet:gap-[2vw] desktop:gap-[0.833vw]">
        <CategoryChart data={stats.categoryDistribution} />
        <MonthlyTrendChart data={stats.monthlyTrend} />
      </div>

      {/* Pinned Highlights */}
      <PinnedHighlights entries={stats.pinnedEntries} />

      {/* Timeline */}
      <BragTimeline categories={stats.categoryDistribution} />
    </div>
  );
}

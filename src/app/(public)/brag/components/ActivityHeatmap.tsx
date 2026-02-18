"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, defaultViewport } from "@/app/lib/animations";

interface ActivityHeatmapProps {
  data: { date: string; count: number }[];
}

function getColor(count: number, maxCount: number): string {
  if (count === 0) return "rgba(6, 182, 212, 0.05)";
  const ratio = count / maxCount;
  if (ratio <= 0.25) return "rgba(6, 182, 212, 0.2)";
  if (ratio <= 0.5) return "rgba(6, 182, 212, 0.4)";
  if (ratio <= 0.75) return "rgba(6, 182, 212, 0.6)";
  return "rgba(6, 182, 212, 0.9)";
}

const DAYS = ["Mon", "", "Wed", "", "Fri", "", ""];
const CELL_SIZE = 12;
const CELL_GAP = 3;

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const { weeks, maxCount, months } = useMemo(() => {
    const map = new Map<string, number>();
    let maxCount = 1;
    for (const d of data) {
      map.set(d.date, d.count);
      if (d.count > maxCount) maxCount = d.count;
    }

    // Build 52 weeks of data ending at today
    const today = new Date();
    const weeks: { date: Date; count: number }[][] = [];
    const months: { label: string; weekIndex: number }[] = [];

    // Find the start: go back ~52 weeks to the nearest Sunday
    const start = new Date(today);
    start.setDate(start.getDate() - 364 - start.getDay());

    let currentMonth = -1;
    let currentWeek: { date: Date; count: number }[] = [];

    for (let i = 0; i <= 371; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      if (d > today) break;

      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      const month = d.getMonth();
      if (month !== currentMonth) {
        currentMonth = month;
        months.push({
          label: d.toLocaleString("en-US", { month: "short" }),
          weekIndex: weeks.length,
        });
      }

      const key = d.toISOString().split("T")[0];
      currentWeek.push({ date: d, count: map.get(key) || 0 });
    }
    if (currentWeek.length > 0) weeks.push(currentWeek);

    return { weeks, maxCount, months };
  }, [data]);

  const labelWidth = 28;
  const svgWidth = labelWidth + weeks.length * (CELL_SIZE + CELL_GAP);
  const svgHeight = 7 * (CELL_SIZE + CELL_GAP) + 20;

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      className="bg-bg-secondary border border-border-subtle rounded-lg p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw]"
    >
      <h3 className="text-text-heading text-[4.267vw] tablet:text-[2vw] desktop:text-[0.833vw] font-semibold mb-[4vw] tablet:mb-[2vw] desktop:mb-[0.833vw]">
        Activity
      </h3>
      <div className="overflow-x-auto relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full"
          style={{ minWidth: "600px" }}
        >
          {/* Month labels */}
          {months.map((m, i) => (
            <text
              key={i}
              x={labelWidth + m.weekIndex * (CELL_SIZE + CELL_GAP)}
              y={10}
              fill="#A1A1AA"
              fontSize="9"
            >
              {m.label}
            </text>
          ))}

          {/* Day labels */}
          {DAYS.map((label, i) => (
            label && (
              <text
                key={i}
                x={0}
                y={20 + i * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 2}
                fill="#A1A1AA"
                fontSize="8"
              >
                {label}
              </text>
            )
          ))}

          {/* Cells */}
          {weeks.map((week, wi) =>
            week.map((day) => {
              const dayOfWeek = day.date.getDay();
              const row = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
              const x = labelWidth + wi * (CELL_SIZE + CELL_GAP);
              const y = 18 + row * (CELL_SIZE + CELL_GAP);

              return (
                <rect
                  key={day.date.toISOString()}
                  x={x}
                  y={y}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={2}
                  fill={getColor(day.count, maxCount)}
                  className="cursor-pointer"
                  onMouseEnter={(e) => {
                    const rect = (e.target as SVGRectElement).getBoundingClientRect();
                    setTooltip({
                      x: rect.left + rect.width / 2,
                      y: rect.top - 8,
                      text: `${day.count} ${day.count === 1 ? "entry" : "entries"} on ${day.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            }),
          )}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 bg-bg-tertiary text-foreground text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] px-[2.667vw] tablet:px-[1.333vw] desktop:px-[0.556vw] py-[1.333vw] tablet:py-[0.667vw] desktop:py-[0.278vw] rounded-md shadow-lg pointer-events-none border border-border-subtle whitespace-nowrap"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(-50%, -100%)",
            }}
          >
            {tooltip.text}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-[1.333vw] tablet:gap-[0.667vw] desktop:gap-[0.278vw] mt-[2.667vw] tablet:mt-[1.333vw] desktop:mt-[0.556vw]">
        <span className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]">Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <span
            key={ratio}
            className="w-[3vw] h-[3vw] tablet:w-[1.5vw] tablet:h-[1.5vw] desktop:w-[0.625vw] desktop:h-[0.625vw] rounded-sm inline-block"
            style={{ backgroundColor: getColor(ratio === 0 ? 0 : ratio, 1) }}
          />
        ))}
        <span className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]">More</span>
      </div>
    </motion.div>
  );
}

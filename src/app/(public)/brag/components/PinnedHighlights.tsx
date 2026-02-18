"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, defaultViewport } from "@/app/lib/animations";

interface PinnedEntry {
  id: string;
  title: string;
  description: string;
  impact: string | null;
  date: Date | string;
  category: { name: string; color: string | null };
}

interface PinnedHighlightsProps {
  entries: PinnedEntry[];
}

export default function PinnedHighlights({ entries }: PinnedHighlightsProps) {
  if (entries.length === 0) return null;

  return (
    <div>
      <h3 className="text-text-heading text-[5.333vw] tablet:text-[2.5vw] desktop:text-[1.042vw] font-semibold mb-[4vw] tablet:mb-[2vw] desktop:mb-[0.833vw]">
        Highlights
      </h3>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-[4vw] tablet:gap-[2vw] desktop:gap-[0.833vw]"
      >
        {entries.map((entry) => (
          <motion.div
            key={entry.id}
            variants={fadeUp}
            className="gradient-border bg-bg-secondary rounded-lg p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw] space-y-[2.667vw] tablet:space-y-[1.333vw] desktop:space-y-[0.556vw]"
          >
            <div className="flex items-center justify-between">
              <span
                className="px-[2.667vw] tablet:px-[1.333vw] desktop:px-[0.556vw] py-[1.067vw] tablet:py-[0.5vw] desktop:py-[0.208vw] rounded-full text-[2.4vw] tablet:text-[1.1vw] desktop:text-[0.458vw] font-medium"
                style={{
                  backgroundColor: (entry.category.color || "#06B6D4") + "1A",
                  color: entry.category.color || "#06B6D4",
                }}
              >
                {entry.category.name}
              </span>
              <span className="text-text-muted text-[2.4vw] tablet:text-[1.1vw] desktop:text-[0.458vw]">
                {new Date(entry.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <h4 className="text-text-heading text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] font-semibold">
              {entry.title}
            </h4>
            <p className="text-text-muted text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] line-clamp-3">
              {entry.description}
            </p>
            {entry.impact && (
              <p className="text-accent-emerald text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] font-medium">
                {entry.impact}
              </p>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

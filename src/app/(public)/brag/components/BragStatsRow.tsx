"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, defaultViewport } from "@/app/lib/animations";

interface BragStatsRowProps {
  totalEntries: number;
  entriesThisMonth: number;
  currentStreak: number;
  categoriesActive: number;
}

const stats = [
  { key: "totalEntries", label: "Total Entries", color: "text-accent-cyan" },
  { key: "entriesThisMonth", label: "This Month", color: "text-accent-purple" },
  { key: "currentStreak", label: "Week Streak", color: "text-accent-emerald" },
  { key: "categoriesActive", label: "Categories", color: "text-accent-cyan" },
] as const;

export default function BragStatsRow(props: BragStatsRowProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      className="grid grid-cols-2 desktop:grid-cols-4 gap-[4vw] tablet:gap-[2vw] desktop:gap-[0.833vw]"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.key}
          variants={fadeUp}
          className="bg-bg-secondary border border-border-subtle rounded-lg p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw] text-center"
        >
          <p className={`${stat.color} text-[8.533vw] tablet:text-[4vw] desktop:text-[1.667vw] font-bold`}>
            {props[stat.key]}
          </p>
          <p className="text-text-muted text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}

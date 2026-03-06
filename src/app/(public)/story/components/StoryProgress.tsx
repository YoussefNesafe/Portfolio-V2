"use client";

import { motion } from "framer-motion";

interface StoryProgressProps {
  current: number;
  total: number;
  accentColor: string;
}

export default function StoryProgress({
  current,
  total,
  accentColor,
}: StoryProgressProps) {
  const progress = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[0.8vw] tablet:h-[0.375vw] desktop:h-[0.156vw] bg-bg-secondary/50">
      <motion.div
        className="h-full"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`,
        }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </div>
  );
}

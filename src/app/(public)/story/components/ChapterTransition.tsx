"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chapterFade } from "@/app/lib/animations";

interface ChapterTransitionProps {
  isActive: boolean;
  title: string;
  subtitle: string;
  accentColor: string;
  onComplete: () => void;
}

export default function ChapterTransition({
  isActive,
  title,
  subtitle,
  accentColor,
  onComplete,
}: ChapterTransitionProps) {
  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(onComplete, 1800);
    return () => clearTimeout(timer);
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: `linear-gradient(135deg, #0A0A0F 0%, ${accentColor}15 100%)` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.h2
            variants={chapterFade}
            initial="hidden"
            animate="visible"
            className="text-[10.667vw] tablet:text-[5vw] desktop:text-[2.604vw] font-bold text-text-heading text-center"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-[4.267vw] tablet:text-[2vw] desktop:text-[0.833vw] mt-[2.667vw] tablet:mt-[1.25vw] desktop:mt-[0.521vw]"
            style={{ color: accentColor }}
          >
            {subtitle}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

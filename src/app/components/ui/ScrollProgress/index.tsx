"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-[0.8vw] tablet:h-[0.375vw] desktop:h-[0.104vw] origin-left bg-gradient-to-r from-accent-cyan to-accent-purple"
      style={{ scaleX }}
    />
  );
}

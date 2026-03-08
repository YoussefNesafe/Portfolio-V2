"use client";

import { useScroll, useTransform, useSpring, useReducedMotion, type MotionValue } from "framer-motion";
import { useRef } from "react";

interface UseParallaxOptions {
  speed?: number;
  offset?: ["start end" | "end start", "start end" | "end start"];
  springConfig?: { stiffness?: number; damping?: number };
}

interface UseParallaxReturn {
  ref: React.RefObject<HTMLDivElement | null>;
  y: MotionValue<number>;
}

export function useParallax({
  speed = 0.5,
  offset = ["start end", "end start"],
  springConfig = { stiffness: 100, damping: 30 },
}: UseParallaxOptions = {}): UseParallaxReturn {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset,
  });

  const range = speed * 100;
  const rawY = useTransform(scrollYProgress, [0, 1], [range, -range]);
  const y = useSpring(rawY, springConfig);

  const zeroY = useTransform(() => 0);

  return {
    ref,
    y: prefersReducedMotion ? zeroY : y,
  };
}

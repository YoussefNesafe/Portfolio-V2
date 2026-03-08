"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import GlowCard from "@/app/components/ui/GlowCard";

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export default function AnimatedCounter({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutBack(progress);
      const current = eased * value;

      if (progress >= 1) {
        setCount(value);
      } else {
        setCount(Math.floor(current * 10) / 10);
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [isInView, value]);

  const displayValue =
    value % 1 !== 0 ? count.toFixed(1) : Math.floor(count).toLocaleString();

  return (
    <GlowCard>
      <div ref={ref} className="text-center">
        <span className="text-[8.533vw] tablet:text-[4vw] desktop:text-[1.667vw] font-bold gradient-text">
          {displayValue}
          {suffix}
        </span>
        <p className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-text-muted mt-[1.067vw] tablet:mt-[0.5vw] desktop:mt-[0.208vw]">
          {label}
        </p>
      </div>
    </GlowCard>
  );
}

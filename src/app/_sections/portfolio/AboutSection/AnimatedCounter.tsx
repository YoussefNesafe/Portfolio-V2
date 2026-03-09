"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

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
    <div className="relative group">
      {/* Gradient orb behind card */}
      <div className="absolute -inset-[2.667vw] tablet:-inset-[1.25vw] desktop:-inset-[0.521vw] bg-accent-cyan/10 rounded-full blur-[5.333vw] tablet:blur-[2.5vw] desktop:blur-[1.042vw] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div
        ref={ref}
        className="relative rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw] border border-white/10 bg-white/5 backdrop-blur-[16px] p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw] text-center transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08]"
      >
        <span className="text-[8.533vw] tablet:text-[4vw] desktop:text-[1.667vw] font-bold gradient-text">
          {displayValue}
          {suffix}
        </span>
        <p className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-text-muted mt-[1.067vw] tablet:mt-[0.5vw] desktop:mt-[0.208vw]">
          {label}
        </p>
      </div>
    </div>
  );
}

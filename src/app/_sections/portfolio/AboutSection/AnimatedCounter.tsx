"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import GlowCard from "@/app/components/ui/GlowCard";

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
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current * 10) / 10);
      }
    }, duration / steps);

    return () => clearInterval(timer);
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

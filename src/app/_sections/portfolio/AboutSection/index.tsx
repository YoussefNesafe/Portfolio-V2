"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  fadeLeft,
  fadeUp,
  staggerContainer,
  defaultViewport,
} from "@/app/lib/animations";
import type { IAboutSection } from "@/app/models/About";
import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";
import Terminal from "@/app/components/ui/Terminal";
import GlowCard from "@/app/components/ui/GlowCard";

function AnimatedCounter({
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

export default function AboutSection(props: IAboutSection) {
  return (
    <Section id="about">
      <SectionHeading label={props.sectionLabel} title={props.title} />

      <div className="flex flex-col desktop:flex-row gap-[8.533vw] tablet:gap-[4vw] desktop:gap-[1.667vw]">
        {/* Terminal */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeLeft}
          className="desktop:w-[55%]"
        >
          <Terminal title="about.txt">
            <p className="text-accent-emerald mb-[2.667vw] tablet:mb-[1.25vw] desktop:mb-[0.521vw]">
              {props.terminal.command}
            </p>
            {props.terminal.lines.map((line, i) => (
              <p key={i} className="text-foreground mb-[2.667vw] tablet:mb-[1.25vw] desktop:mb-[0.521vw] last:mb-0">
                {line}
              </p>
            ))}
            <span className="animate-blink-cursor text-accent-cyan">_</span>
          </Terminal>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={staggerContainer}
          className="desktop:w-[45%] grid grid-cols-2 gap-[4.267vw] tablet:gap-[2vw] desktop:gap-[0.833vw]"
        >
          {props.stats.map((stat) => (
            <motion.div key={stat.label} variants={fadeUp}>
              <AnimatedCounter
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}

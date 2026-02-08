"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import type { IExperienceSection } from "@/app/models/Experience";
import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";
import TimelineItem from "@/app/components/ui/TimelineItem";

export default function ExperienceSection(props: IExperienceSection) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  return (
    <Section id="experience">
      <SectionHeading label={props.sectionLabel} title={props.title} />

      <div ref={containerRef} className="relative">
        {/* Glowing timeline line (desktop only) */}
        <div className="hidden desktop:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[0.104vw] z-10">
          <motion.div
            className="h-full w-full bg-linear-to-b from-accent-cyan via-accent-purple to-accent-cyan/20 origin-top"
            style={{ scaleY }}
          />
        </div>

        {/* Timeline items */}
        <div className="flex flex-col gap-[2.667vw] tablet:gap-[1.25vw] desktop:gap-[1.042vw]">
          {props.items.map((item, index) => (
            <TimelineItem
              key={`${item.company}-${item.period}`}
              item={item}
              index={index}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}

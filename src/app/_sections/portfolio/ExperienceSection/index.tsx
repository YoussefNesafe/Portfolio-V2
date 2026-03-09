"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { IExperienceSection } from "@/app/models/Experience";
import type { ExperienceItem } from "@/app/models/common";
import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";
import { fadeLeft, fadeRight, defaultViewport } from "@/app/lib/animations";

export default function ExperienceSection(props: IExperienceSection) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Drive the path drawing
  const pathLength = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

  return (
    <Section id="experience">
      <SectionHeading label={props.sectionLabel} title={props.title} />

      <div ref={containerRef} className="relative">
        {/* SVG River Path — desktop only */}
        <svg
          className="hidden desktop:block absolute left-1/2 -translate-x-1/2 top-0 h-full w-[10.417vw] overflow-visible"
          viewBox="0 0 200 1000"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="river-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.3" />
            </linearGradient>
            <filter id="river-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <motion.path
            d="M 100 0 C 60 100, 140 200, 100 300 C 60 400, 140 500, 100 600 C 60 700, 140 800, 100 1000"
            stroke="url(#river-gradient)"
            strokeWidth="2"
            filter="url(#river-glow)"
            style={{ pathLength }}
          />
        </svg>

        {/* Mobile: simple vertical line */}
        <div className="desktop:hidden absolute left-[4.267vw] tablet:left-[2vw] top-0 bottom-0 w-[0.533vw] tablet:w-[0.25vw]">
          <motion.div
            className="h-full w-full bg-gradient-to-b from-accent-cyan via-accent-purple to-accent-cyan/20 origin-top"
            style={{ scaleY: pathLength }}
          />
        </div>

        {/* Experience cards */}
        <div className="flex flex-col gap-[8.533vw] tablet:gap-[4vw] desktop:gap-[2.083vw]">
          {props.items.map((item, index) => (
            <ExperienceCard
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

function ExperienceCard({
  item,
  index,
}: {
  item: ExperienceItem;
  index: number;
}) {
  const isEven = index % 2 === 0;

  return (
    <div className="relative flex desktop:items-center">
      {/* Desktop: alternating layout */}
      <div
        className={`hidden desktop:flex w-full items-center gap-[2.083vw] ${isEven ? "" : "flex-row-reverse"}`}
      >
        <div className="w-[45%]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={isEven ? fadeLeft : fadeRight}
            whileHover={{
              y: -4,
              transition: { type: "spring", stiffness: 400, damping: 25 },
            }}
          >
            <GlassCard item={item} />
          </motion.div>
        </div>
        <div className="w-[10%]" /> {/* space for river */}
        <div className="w-[45%]" />
      </div>

      {/* Mobile/tablet: left-aligned */}
      <div className="desktop:hidden pl-[10.667vw] tablet:pl-[5vw]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeLeft}
          whileHover={{
            y: -4,
            transition: { type: "spring", stiffness: 400, damping: 25 },
          }}
        >
          <GlassCard item={item} />
        </motion.div>
      </div>
    </div>
  );
}

function GlassCard({ item }: { item: ExperienceItem }) {
  return (
    <div className="rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw] border border-white/10 bg-white/5 backdrop-blur-[16px] p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw] transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08]">
      <div className="flex flex-wrap items-center justify-between gap-[2.133vw] tablet:gap-[1vw] desktop:gap-[0.417vw] mb-[2.667vw] tablet:mb-[1.25vw] desktop:mb-[0.521vw]">
        <div>
          <h3 className="text-text-heading">{item.role}</h3>
          <p className="text-accent-cyan text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] font-medium">
            {item.company}
          </p>
        </div>
        <div className="flex items-center gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw]">
          <span className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-text-muted bg-white/5 rounded-[1.333vw] tablet:rounded-[0.625vw] desktop:rounded-[0.26vw] px-[2.667vw] py-[0.8vw] tablet:px-[1.25vw] tablet:py-[0.375vw] desktop:px-[0.521vw] desktop:py-[0.156vw]">
            {item.period}
          </span>
          <span className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-text-muted">
            {item.location}
          </span>
        </div>
      </div>

      <p className="text-text-muted text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] mb-[2.667vw] tablet:mb-[1.25vw] desktop:mb-[0.521vw] italic">
        {item.description}
      </p>

      <ul className="space-y-[1.6vw] tablet:space-y-[0.75vw] desktop:space-y-[0.313vw] mb-[4.267vw] tablet:mb-[2vw] desktop:mb-[0.833vw]">
        {item.achievements.map((achievement, i) => (
          <li
            key={i}
            className="text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] text-foreground flex gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw]"
          >
            <span className="text-accent-emerald shrink-0">&#9656;</span>
            <span>{achievement}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw]">
        {item.tech.map((tech) => (
          <span
            key={tech}
            className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-accent-cyan bg-accent-cyan/10 rounded-[1.067vw] tablet:rounded-[0.5vw] desktop:rounded-[0.208vw] px-[2.133vw] py-[0.533vw] tablet:px-[1vw] tablet:py-[0.25vw] desktop:px-[0.417vw] desktop:py-[0.104vw] font-mono"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}

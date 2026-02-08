"use client";

import { motion } from "framer-motion";
import { fadeLeft, fadeRight, defaultViewport } from "@/app/lib/animations";
import type { ExperienceItem } from "@/app/models/common";
import GlowCard from "../GlowCard";

interface TimelineItemProps {
  item: ExperienceItem;
  index: number;
}

export default function TimelineItem({ item, index }: TimelineItemProps) {
  const isEven = index % 2 === 0;

  return (
    <div className="relative flex flex-col desktop:flex-row desktop:items-start gap-[4.267vw] tablet:gap-[2vw] desktop:gap-0">
      {/* Desktop: alternating sides */}
      <div className="hidden desktop:block desktop:w-[45%]">
        {isEven && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={fadeLeft}
          >
            <TimelineCard item={item} />
          </motion.div>
        )}
      </div>

      {/* Center dot */}
      <div className="hidden desktop:flex desktop:w-[10%] justify-center">
        <div className="w-[0.833vw] h-[0.833vw] rounded-full bg-accent-cyan glow-cyan mt-[1.25vw]" />
      </div>

      <div className="hidden desktop:block desktop:w-[45%]">
        {!isEven && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={fadeRight}
          >
            <TimelineCard item={item} />
          </motion.div>
        )}
      </div>

      {/* Mobile/Tablet: always left-aligned */}
      <div className="desktop:hidden flex gap-[4.267vw] tablet:gap-[2vw]">
        {/* Dot */}
        <div className="flex flex-col items-center">
          <div className="w-[2.667vw] h-[2.667vw] tablet:w-[1.25vw] tablet:h-[1.25vw] rounded-full bg-accent-cyan glow-cyan mt-[2.133vw] tablet:mt-[1vw] shrink-0" />
          <div className="w-[0.267vw] tablet:w-[0.125vw] flex-1 bg-gradient-to-b from-accent-cyan/50 to-transparent mt-[1.067vw] tablet:mt-[0.5vw]" />
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeLeft}
          className="flex-1 pb-[5.333vw] tablet:pb-[2.5vw]"
        >
          <TimelineCard item={item} />
        </motion.div>
      </div>
    </div>
  );
}

function TimelineCard({ item }: { item: ExperienceItem }) {
  return (
    <GlowCard>
      <div className="flex flex-wrap items-center justify-between gap-[2.133vw] tablet:gap-[1vw] desktop:gap-[0.417vw] mb-[2.667vw] tablet:mb-[1.25vw] desktop:mb-[0.521vw]">
        <div>
          <h3 className="text-text-heading">{item.role}</h3>
          <p className="text-accent-cyan text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] font-medium">
            {item.company}
          </p>
        </div>
        <div className="flex items-center gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw]">
          <span className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-text-muted bg-bg-tertiary rounded-[1.333vw] tablet:rounded-[0.625vw] desktop:rounded-[0.26vw] px-[2.667vw] py-[0.8vw] tablet:px-[1.25vw] tablet:py-[0.375vw] desktop:px-[0.521vw] desktop:py-[0.156vw]">
            {item.period}
          </span>
          <span className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-text-muted">{item.location}</span>
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
    </GlowCard>
  );
}

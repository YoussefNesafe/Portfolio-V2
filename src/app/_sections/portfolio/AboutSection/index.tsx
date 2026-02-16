"use client";

import { motion } from "framer-motion";
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
import AnimatedCounter from "./AnimatedCounter";

export default function AboutSection(props: IAboutSection) {
  return (
    <Section id="about">
      <SectionHeading label={props.sectionLabel} title={props.title} />

      <div className="flex flex-col desktop:flex-row gap-[8.533vw] tablet:gap-[4vw] desktop:gap-[1.667vw] items-center">
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
              <p
                key={i}
                className="text-foreground mb-[2.667vw] tablet:mb-[1.25vw] desktop:mb-[0.521vw] last:mb-0"
              >
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
          className="desktop:w-[45%] grid grid-cols-2 gap-[4.267vw] tablet:gap-[2vw] desktop:gap-[0.833vw] h-fit"
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

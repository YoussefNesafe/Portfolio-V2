"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  fadeUp,
  staggerContainer,
  defaultViewport,
} from "@/app/lib/animations";
import type { IAboutSection } from "@/app/models/About";
import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";
import AnimatedCounter from "./AnimatedCounter";

export default function AboutSection(props: IAboutSection) {
  const textRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: textRef,
    offset: ["start end", "center center"],
  });

  // Overlay slides down to reveal text underneath
  const overlayY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <Section id="about">
      <SectionHeading label={props.sectionLabel} title={props.title} />

      <div className="flex flex-col desktop:flex-row gap-[8.533vw] tablet:gap-[4vw] desktop:gap-[1.667vw] items-start">
        {/* Bio text with scroll-linked mask reveal */}
        <motion.div
          ref={textRef}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeUp}
          className="desktop:w-[55%]"
        >
          <div className="relative overflow-hidden">
            <div>
              {props.terminal.lines.map((line, i) => (
                <p
                  key={i}
                  className="text-[4.267vw] tablet:text-[2vw] desktop:text-[0.833vw] text-foreground/90 mb-[4.267vw] tablet:mb-[2vw] desktop:mb-[0.833vw] last:mb-0 leading-[1.8]"
                >
                  {line}
                </p>
              ))}
            </div>
            {/* Overlay that slides down to reveal text */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-background to-background pointer-events-none"
              style={{ y: overlayY }}
            />
          </div>
        </motion.div>

        {/* Stats with glassmorphism */}
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

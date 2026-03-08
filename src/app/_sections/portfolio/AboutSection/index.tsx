"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import {
  fadeUp,
  staggerContainer,
  defaultViewport,
} from "@/app/lib/animations";
import type { IAboutSection } from "@/app/models/About";
import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";
import Terminal from "@/app/components/ui/Terminal";
import AnimatedCounter from "./AnimatedCounter";
import TypewriterText from "@/app/components/ui/TypewriterText";
import { useParallax } from "@/app/hooks/useParallax";

export default function AboutSection(props: IAboutSection) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalParallax = useParallax({ speed: 0.15, targetRef: containerRef });
  const statsParallax = useParallax({ speed: 0.25, targetRef: containerRef });

  return (
    <Section id="about">
      <SectionHeading label={props.sectionLabel} title={props.title} />

      <div
        ref={containerRef}
        className="flex flex-col desktop:flex-row gap-[8.533vw] tablet:gap-[4vw] desktop:gap-[1.667vw] items-center"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={{
            hidden: { opacity: 0, x: -50 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
          }}
          style={{ y: terminalParallax.y }}
          className="desktop:w-[55%]"
        >
          <Terminal title="about.txt">
            <p className="text-accent-emerald mb-[2.667vw] tablet:mb-[1.25vw] desktop:mb-[0.521vw]">
              {props.terminal.command}
            </p>
            <TypewriterText
              lines={props.terminal.lines.map((line) => ({
                text: line,
                className:
                  "text-foreground mb-[2.667vw] tablet:mb-[1.25vw] desktop:mb-[0.521vw] last:mb-0",
              }))}
              speed={15}
              lineDelay={100}
            />
          </Terminal>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={staggerContainer}
          style={{ y: statsParallax.y }}
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

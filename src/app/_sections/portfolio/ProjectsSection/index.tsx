"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import type { IProjectsSection } from "@/app/models/Projects";
import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";
import { fadeUp, defaultViewport } from "@/app/lib/animations";
import ProjectCard from "./ProjectCard";

export default function ProjectsSection(props: IProjectsSection) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const count = props.items.length;

  // Track which card is snapped to via scroll position
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const cardWidth = el.scrollWidth / count;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.max(0, Math.min(count - 1, index)));
  }, [count]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const goTo = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / count;
    el.scrollTo({ left: cardWidth * index, behavior: "smooth" });
  }, [count]);

  return (
    <Section id="projects">
      <SectionHeading label={props.sectionLabel} title={props.title} />

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
      >
        {/* Horizontal scroll-snap carousel */}
        <div
          ref={scrollRef}
          className="flex gap-[5.333vw] tablet:gap-[2.5vw] desktop:gap-[1.042vw] overflow-x-auto snap-x snap-mandatory scroll-smooth pb-[4vw] tablet:pb-[2vw] desktop:pb-[0.833vw] -mx-[4.267vw] tablet:-mx-[5vw] desktop:-mx-[0.521vw] px-[4.267vw] tablet:px-[5vw] desktop:px-[0.521vw] no-scrollbar"
        >
          {props.items.map((item, index) => (
            <div
              key={item.id}
              className="snap-center shrink-0 w-[85vw] tablet:w-[60vw] desktop:w-[30vw]"
            >
              <ProjectCard
                item={item}
                isFocused={index === activeIndex}
              />
            </div>
          ))}
        </div>

        {/* Navigation dots */}
        <div className="flex items-center justify-center mt-[4vw] tablet:mt-[2vw] desktop:mt-[0.833vw]">
          <div className="relative flex items-center gap-[4vw] tablet:gap-[1.875vw] desktop:gap-[0.781vw]">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-[2vw] right-[2vw] tablet:left-[0.938vw] tablet:right-[0.938vw] desktop:left-[0.391vw] desktop:right-[0.391vw] h-[0.267vw] tablet:h-[0.125vw] desktop:h-[0.052vw] -translate-y-1/2 bg-gradient-to-r from-accent-cyan/20 via-accent-purple/30 to-accent-cyan/20 rounded-full" />

            {props.items.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Go to project: ${item.title}`}
                  aria-current={isActive ? "true" : undefined}
                  className="relative z-10"
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.4 : 1,
                      boxShadow: isActive
                        ? "0 0 12px 3px rgba(6,182,212,0.5), 0 0 24px 6px rgba(168,85,247,0.25)"
                        : "0 0 4px 1px rgba(6,182,212,0.15)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 22,
                    }}
                    className="w-[2.667vw] h-[2.667vw] tablet:w-[1.25vw] tablet:h-[1.25vw] desktop:w-[0.521vw] desktop:h-[0.521vw] rounded-full"
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, #06B6D4, #A855F7)"
                        : "rgba(6,182,212,0.3)",
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Project counter */}
        <p className="text-center mt-[2.667vw] tablet:mt-[1.25vw] desktop:mt-[0.521vw] font-mono text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-white/30">
          <span className="text-accent-cyan">
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          {" / "}
          {String(count).padStart(2, "0")}
        </p>
      </motion.div>
    </Section>
  );
}

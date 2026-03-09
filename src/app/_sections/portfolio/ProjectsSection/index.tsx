"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { IProjectsSection } from "@/app/models/Projects";
import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";
import { fadeUp, defaultViewport } from "@/app/lib/animations";
import ProjectCard from "./ProjectCard";

export default function ProjectsSection(props: IProjectsSection) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const count = props.items.length;

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(Math.max(0, Math.min(count - 1, index)));
    },
    [count]
  );

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev < count - 1 ? prev + 1 : prev));
  }, [count]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const inView =
        rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  // Touch handlers for mobile swipe
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchDeltaX.current = 0;
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    },
    []
  );

  const handleTouchEnd = useCallback(() => {
    const threshold = 50;
    if (touchDeltaX.current < -threshold) {
      goNext();
    } else if (touchDeltaX.current > threshold) {
      goPrev();
    }
  }, [goNext, goPrev]);

  return (
    <Section id="projects">
      <SectionHeading label={props.sectionLabel} title={props.title} />

      <motion.div
        ref={containerRef}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        className="relative"
      >
        {/* Carousel container */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: "clamp(480px, 55vw, 700px)" }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Prev / Next click zones — desktop only */}
          <button
            type="button"
            onClick={goPrev}
            disabled={activeIndex === 0}
            aria-label="Previous project"
            className="hidden tablet:block absolute left-0 top-0 w-[20%] h-full z-20 cursor-pointer disabled:cursor-default"
          />
          <button
            type="button"
            onClick={goNext}
            disabled={activeIndex === count - 1}
            aria-label="Next project"
            className="hidden tablet:block absolute right-0 top-0 w-[20%] h-full z-20 cursor-pointer disabled:cursor-default"
          />

          {/* Cards */}
          {props.items.map((item, index) => {
            const position = index - activeIndex;
            // Only render cards within visible range
            if (Math.abs(position) > 2) return null;
            return (
              <ProjectCard
                key={item.id}
                item={item}
                isFocused={position === 0}
                position={position}
              />
            );
          })}
        </div>

        {/* Navigation dots — glowing orbs connected by line */}
        <div className="flex items-center justify-center mt-[6.667vw] tablet:mt-[3.125vw] desktop:mt-[1.302vw]">
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

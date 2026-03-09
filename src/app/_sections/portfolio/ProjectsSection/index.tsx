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
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  // Triple the items for infinite scroll illusion
  const tripled = [...props.items, ...props.items, ...props.items];

  // Center the scroll on the middle set on mount
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Wait for layout
    requestAnimationFrame(() => {
      const cardEls = el.children;
      if (cardEls.length === 0) return;
      const card = cardEls[0] as HTMLElement;
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      const cardW = card.offsetWidth + gap;
      // Scroll to the start of the middle set
      el.scrollLeft = cardW * count;
    });
  }, [count]);

  // Track active index + infinite loop reset
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isDragging.current) return;

    const cardEls = el.children;
    if (cardEls.length === 0) return;
    const card = cardEls[0] as HTMLElement;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const cardW = card.offsetWidth + gap;
    const containerCenter = el.scrollLeft + el.offsetWidth / 2;
    const rawIndex = Math.round((containerCenter - card.offsetWidth / 2) / cardW);
    const realIndex = ((rawIndex % count) + count) % count;
    setActiveIndex(realIndex);

    // Reset to middle set when reaching edges
    const firstSetEnd = cardW * count;
    const thirdSetStart = cardW * count * 2;

    if (el.scrollLeft < firstSetEnd - cardW) {
      el.scrollLeft += cardW * count;
    } else if (el.scrollLeft > thirdSetStart) {
      el.scrollLeft -= cardW * count;
    }
  }, [count]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = true;
    dragStartX.current = e.pageX - el.offsetLeft;
    dragScrollLeft.current = el.scrollLeft;
    el.style.cursor = "grabbing";
    el.style.scrollSnapType = "none";
    el.style.scrollBehavior = "auto";
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragStartX.current) * 1.5;
    el.scrollLeft = dragScrollLeft.current - walk;
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const el = scrollRef.current;
    if (!el) return;
    el.style.cursor = "grab";
    el.style.scrollSnapType = "x mandatory";
    el.style.scrollBehavior = "smooth";
    // Trigger snap to nearest
    handleScroll();
  }, [handleScroll]);

  useEffect(() => {
    const handleGlobalUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        const el = scrollRef.current;
        if (el) {
          el.style.cursor = "grab";
          el.style.scrollSnapType = "x mandatory";
          el.style.scrollBehavior = "smooth";
        }
      }
    };
    window.addEventListener("mouseup", handleGlobalUp);
    return () => window.removeEventListener("mouseup", handleGlobalUp);
  }, []);

  const goTo = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardEls = el.children;
    if (cardEls.length === 0) return;
    const card = cardEls[0] as HTMLElement;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const cardW = card.offsetWidth + gap;
    // Scroll to the middle set's version of this index
    const target = cardW * (count + index) - (el.offsetWidth - card.offsetWidth) / 2;
    el.scrollTo({ left: target, behavior: "smooth" });
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
        {/* Drag-to-scroll carousel with centered snap */}
        <div
          ref={scrollRef}
          className="flex gap-[5.333vw] tablet:gap-[2.5vw] desktop:gap-[1.042vw] overflow-x-auto snap-x snap-mandatory scroll-smooth pb-[4vw] tablet:pb-[2vw] desktop:pb-[0.833vw] no-scrollbar select-none"
          style={{ cursor: "grab" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {tripled.map((item, index) => {
            const realIndex = index % count;
            return (
              <div
                key={`${item.id}-${index}`}
                className="snap-center shrink-0 w-[85vw] tablet:w-[60vw] desktop:w-[30vw]"
              >
                <ProjectCard
                  item={item}
                  isFocused={realIndex === activeIndex}
                />
              </div>
            );
          })}
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

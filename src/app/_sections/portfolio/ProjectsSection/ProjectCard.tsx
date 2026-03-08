"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { fadeUp, defaultViewport } from "@/app/lib/animations";
import type { ProjectItem } from "@/app/models/common";
import { useTilt } from "@/app/hooks/useTilt";

export default function ProjectCard({ item, index }: { item: ProjectItem; index: number }) {
  const imageRef = useRef<HTMLDivElement>(null);
  const { ref: tiltRef, style: tiltStyle, handlers } = useTilt({ maxTilt: 6, scale: 1.01 });

  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <motion.div
      ref={tiltRef}
      data-xray="ProjectCard"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
      className="rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw] border border-border-subtle bg-bg-secondary overflow-hidden transition-all duration-300 hover:border-accent-cyan/30 hover:glow-cyan will-change-transform"
      style={tiltStyle}
      {...handlers}
    >
      <div ref={imageRef} className="relative aspect-video overflow-hidden group">
        <motion.div className="absolute inset-[-10%]" style={{ y: imageY }}>
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 800px) 100vw, 50vw"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAADklEQVQI12P4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg=="
          />
        </motion.div>
        <div className="absolute inset-0 bg-linear-to-t from-bg-secondary via-bg-secondary/40 to-transparent" />
        <span className="absolute top-[2.667vw] left-[2.667vw] tablet:top-[1.25vw] tablet:left-[1.25vw] desktop:top-[0.521vw] desktop:left-[0.521vw] font-mono text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 rounded-[1.333vw] tablet:rounded-[0.625vw] desktop:rounded-[0.26vw] px-[2.667vw] py-[0.8vw] tablet:px-[1.25vw] tablet:py-[0.375vw] desktop:px-[0.521vw] desktop:py-[0.156vw]">
          {item.type}
        </span>
      </div>

      <div className="p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw] flex flex-col gap-[3.2vw] tablet:gap-[1.5vw] desktop:gap-[0.625vw]">
        <h3 className="text-text-heading">{item.title}</h3>

        <p className="text-text-muted text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] leading-relaxed">
          {item.description}
        </p>

        <ul className="flex flex-col gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw]">
          {item.highlights.map((highlight) => (
            <li
              key={highlight}
              className="flex items-start gap-[2.133vw] tablet:gap-[1vw] desktop:gap-[0.417vw] text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-foreground"
            >
              <span className="text-accent-emerald mt-[0.8vw] tablet:mt-[0.375vw] desktop:mt-[0.156vw] shrink-0">
                ▹
              </span>
              {highlight}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw] mt-[1.067vw] tablet:mt-[0.5vw] desktop:mt-[0.208vw]">
          {item.tech.map((tech) => (
            <span
              key={tech}
              className="font-mono text-accent-cyan text-[2.667vw] tablet:text-[1.25vw] desktop:text-[0.521vw] bg-accent-cyan/5 border border-accent-cyan/10 rounded-[1.067vw] tablet:rounded-[0.5vw] desktop:rounded-[0.208vw] px-[2.133vw] py-[0.533vw] tablet:px-[1vw] tablet:py-[0.25vw] desktop:px-[0.417vw] desktop:py-[0.104vw]"
            >
              {tech}
            </span>
          ))}
        </div>

        <Link
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw] text-accent-emerald text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] font-medium mt-[1.067vw] tablet:mt-[0.5vw] desktop:mt-[0.208vw] group/link"
        >
          <span className="relative">
            Visit Site
            <span className="absolute bottom-0 left-0 w-0 h-[0.267vw] tablet:h-[0.125vw] desktop:h-[0.052vw] bg-accent-emerald transition-all duration-300 group-hover/link:w-full" />
          </span>
          <svg
            className="w-[3.2vw] h-[3.2vw] tablet:w-[1.5vw] tablet:h-[1.5vw] desktop:w-[0.625vw] desktop:h-[0.625vw] transition-transform group-hover/link:translate-x-[0.267vw] group-hover/link:-translate-y-[0.267vw]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 17L17 7M17 7H7M17 7v10"
            />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
}

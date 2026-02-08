"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, defaultViewport } from "@/app/lib/animations";
import type { IProjectsSection } from "@/app/models/Projects";
import type { ProjectItem } from "@/app/models/common";
import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";

function ProjectCard({ item, index }: { item: ProjectItem; index: number }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
      className="rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw] border border-border-subtle bg-bg-secondary overflow-hidden transition-all duration-300 hover:border-accent-cyan/30 hover:glow-cyan"
    >
      {/* Image area */}
      <div className="relative aspect-video overflow-hidden group">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 800px) 100vw, 50vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-bg-secondary/40 to-transparent" />
        {/* Type badge */}
        <span className="absolute top-[2.667vw] left-[2.667vw] tablet:top-[1.25vw] tablet:left-[1.25vw] desktop:top-[0.521vw] desktop:left-[0.521vw] font-mono text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 rounded-[1.333vw] tablet:rounded-[0.625vw] desktop:rounded-[0.26vw] px-[2.667vw] py-[0.8vw] tablet:px-[1.25vw] tablet:py-[0.375vw] desktop:px-[0.521vw] desktop:py-[0.156vw]">
          {item.type}
        </span>
      </div>

      {/* Content area */}
      <div className="p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw] flex flex-col gap-[3.2vw] tablet:gap-[1.5vw] desktop:gap-[0.625vw]">
        <h3 className="text-text-heading">{item.title}</h3>

        <p className="text-text-muted text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] leading-relaxed">
          {item.description}
        </p>

        {/* Highlights */}
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

        {/* Tech tags */}
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

        {/* Visit Site link */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw] text-accent-emerald text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] font-medium mt-[1.067vw] tablet:mt-[0.5vw] desktop:mt-[0.208vw] hover:underline transition-colors"
        >
          Visit Site
          <svg
            className="w-[3.2vw] h-[3.2vw] tablet:w-[1.5vw] tablet:h-[1.5vw] desktop:w-[0.625vw] desktop:h-[0.625vw]"
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
        </a>
      </div>
    </motion.div>
  );
}

export default function ProjectsSection(props: IProjectsSection) {
  return (
    <Section id="projects">
      <SectionHeading label={props.sectionLabel} title={props.title} />

      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-[5.333vw] tablet:gap-[2.5vw] desktop:gap-[1.042vw]">
        {props.items.map((item, index) => (
          <ProjectCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </Section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTilt } from "@/app/hooks/useTilt";
import type { ProjectItem } from "@/app/models/common";

interface ProjectCardProps {
  item: ProjectItem;
  isFocused: boolean;
}

export default function ProjectCard({ item, isFocused }: ProjectCardProps) {
  const { ref: tiltRef, style: tiltStyle, handlers } = useTilt({
    maxTilt: 6,
    scale: 1.01,
  });

  return (
    <motion.div
      ref={tiltRef}
      data-xray="ProjectCard"
      animate={{
        opacity: isFocused ? 1 : 0.6,
        filter: isFocused ? "blur(0px)" : "blur(1px)",
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-full will-change-transform"
      style={tiltStyle}
      {...handlers}
    >
      <div className="h-full rounded-[3.2vw] tablet:rounded-[1.5vw] desktop:rounded-[0.625vw] border border-white/10 backdrop-blur-[16px] bg-white/5 overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.06)] transition-all duration-300 hover:border-accent-cyan/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.12)]">
        {/* Image with Ken Burns */}
        <div className="relative aspect-video overflow-hidden">
          <motion.div
            className="absolute inset-[-10%]"
            animate={
              isFocused
                ? {
                    scale: [1, 1.08, 1.04, 1.1],
                    x: ["0%", "2%", "-1%", "1%"],
                    y: ["0%", "-1%", "1%", "-0.5%"],
                  }
                : { scale: 1, x: "0%", y: "0%" }
            }
            transition={
              isFocused
                ? {
                    duration: 12,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }
                : { duration: 0.6 }
            }
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 480px) 85vw, (max-width: 1023px) 60vw, 30vw"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAADklEQVQI12P4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg=="
            />
          </motion.div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/50 to-transparent" />

          {/* Type badge */}
          <span className="absolute top-[2.667vw] left-[2.667vw] tablet:top-[1.25vw] tablet:left-[1.25vw] desktop:top-[0.521vw] desktop:left-[0.521vw] font-mono text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 rounded-[1.333vw] tablet:rounded-[0.625vw] desktop:rounded-[0.26vw] px-[2.667vw] py-[0.8vw] tablet:px-[1.25vw] tablet:py-[0.375vw] desktop:px-[0.521vw] desktop:py-[0.156vw]">
            {item.type}
          </span>
        </div>

        {/* Content */}
        <div className="p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw] flex flex-col gap-[2.667vw] tablet:gap-[1.25vw] desktop:gap-[0.521vw]">
          <h3 className="text-[4.8vw] tablet:text-[2.25vw] desktop:text-[0.938vw] font-semibold text-white">
            {item.title}
          </h3>

          <p className="text-[3.467vw] tablet:text-[1.625vw] desktop:text-[0.677vw] text-white/60 leading-relaxed line-clamp-3">
            {item.description}
          </p>

          {/* Highlights */}
          <ul className="flex flex-col gap-[1.333vw] tablet:gap-[0.625vw] desktop:gap-[0.26vw]">
            {item.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw] text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-white/80"
              >
                <span className="text-accent-emerald mt-[0.533vw] tablet:mt-[0.25vw] desktop:mt-[0.104vw] shrink-0">
                  ▹
                </span>
                {highlight}
              </li>
            ))}
          </ul>

          {/* Tech tags */}
          <div className="flex flex-wrap gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw] mt-[1.067vw] tablet:mt-[0.5vw] desktop:mt-[0.208vw]">
            <AnimatePresence mode="popLayout">
              {item.tech.map((tech, i) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, y: 12 }}
                  animate={
                    isFocused
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0.5, y: 0 }
                  }
                  exit={{ opacity: 0, y: 12 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 24,
                    delay: isFocused ? i * 0.04 : 0,
                  }}
                  className="font-mono text-accent-cyan text-[2.667vw] tablet:text-[1.25vw] desktop:text-[0.521vw] bg-accent-cyan/5 border border-accent-cyan/10 rounded-[1.067vw] tablet:rounded-[0.5vw] desktop:rounded-[0.208vw] px-[2.133vw] py-[0.533vw] tablet:px-[1vw] tablet:py-[0.25vw] desktop:px-[0.417vw] desktop:py-[0.104vw]"
                >
                  {tech}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          {/* Link */}
          <Link
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw] text-accent-emerald text-[3.467vw] tablet:text-[1.625vw] desktop:text-[0.677vw] font-medium mt-[1.067vw] tablet:mt-[0.5vw] desktop:mt-[0.208vw] group/link"
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
      </div>
    </motion.div>
  );
}

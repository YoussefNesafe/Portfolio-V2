"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { FiLinkedin, FiMail, FiChevronDown } from "react-icons/fi";
import type { IHeroSection } from "@/app/models/Hero";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

export default function HeroSection(props: IHeroSection) {
  const { scrollYProgress } = useScroll();
  const scrollIndicatorOpacity = useTransform(
    scrollYProgress,
    [0, 0.08],
    [1, 0]
  );
  const scrollIndicatorY = useTransform(scrollYProgress, [0, 0.08], [0, 30]);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* 3D Canvas — desktop only */}
      <div
        className="hidden desktop:block absolute inset-0 z-[1]"
        aria-hidden="true"
      >
        <HeroCanvas />
      </div>

      {/* Mobile SVG fallback */}
      <div
        className="desktop:hidden absolute right-[5vw] top-1/2 -translate-y-1/2 opacity-20"
        aria-hidden="true"
      >
        <svg
          viewBox="-2 -2 4 4"
          className="w-[40vw] h-[40vw] tablet:w-[25vw] tablet:h-[25vw]"
        >
          <g stroke="#06B6D4" strokeWidth="0.05" fill="none" opacity="0.6">
            <circle cx="0" cy="0" r="1.8" />
            <polygon points="0,-1.8 1.56,0.9 -1.56,0.9" />
            <polygon points="0,1.8 1.56,-0.9 -1.56,-0.9" />
          </g>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-[4.267vw] tablet:px-[5vw] desktop:px-[14.063vw]">
        {/* Greeting — simple fade */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="font-mono text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] text-accent-emerald mb-[4.267vw] tablet:mb-[2vw] desktop:mb-[0.833vw]"
        >
          {props.greeting}
        </motion.span>

        {/* Name — clip-path reveal from center */}
        <motion.h1
          initial={{ clipPath: "inset(0 50% 0 50%)", opacity: 0 }}
          animate={{ clipPath: "inset(0 0% 0 0%)", opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.3,
            ease: [0.33, 1, 0.68, 1],
          }}
          className="text-[13.333vw] tablet:text-[7.5vw] desktop:text-[3.646vw] font-bold text-text-heading"
        >
          {props.name}
        </motion.h1>

        {/* Title — blur to sharp */}
        <motion.p
          initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.6,
            ease: [0.33, 1, 0.68, 1],
          }}
          className="text-[6.4vw] tablet:text-[3vw] desktop:text-[1.458vw] text-text-muted font-medium mt-[2.667vw] tablet:mt-[1.25vw] desktop:mt-[0.521vw]"
        >
          {props.titlePrefix}{" "}
          <span className="gradient-text font-bold">
            {props.titleHighlight}
          </span>{" "}
          {props.titleSuffix}
        </motion.p>

        {/* Tagline — blur to sharp */}
        <motion.p
          initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.8,
            ease: [0.33, 1, 0.68, 1],
          }}
          className="text-[4.267vw] tablet:text-[2vw] desktop:text-[0.833vw] text-text-muted max-w-[160vw] tablet:max-w-[75vw] desktop:max-w-[31.25vw] mt-[4.267vw] tablet:mt-[2vw] desktop:mt-[0.833vw]"
        >
          {props.tagline}
        </motion.p>

        {/* CTAs — spring scale-in */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 1.0,
          }}
          className="flex flex-col tablet:flex-row gap-[3.2vw] tablet:gap-[1.5vw] desktop:gap-[0.625vw] mt-[8.533vw] tablet:mt-[4vw] desktop:mt-[1.667vw]"
        >
          <Link
            href={props.ctaPrimary.href}
            className="btn-gradient text-white font-medium text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] px-[6.4vw] py-[3.2vw] tablet:px-[3vw] tablet:py-[1.5vw] desktop:px-[1.25vw] desktop:py-[0.625vw] rounded-[2.133vw] tablet:rounded-[1vw] desktop:rounded-[0.417vw] text-center active:scale-[0.97] transition-transform"
          >
            {props.ctaPrimary.label}
          </Link>
          <Link
            href={props.ctaSecondary.href}
            className="border border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10 font-medium text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] px-[6.4vw] py-[3.2vw] tablet:px-[3vw] tablet:py-[1.5vw] desktop:px-[1.25vw] desktop:py-[0.625vw] rounded-[2.133vw] tablet:rounded-[1vw] desktop:rounded-[0.417vw] text-center active:scale-[0.97] transition-transform"
          >
            {props.ctaSecondary.label}
          </Link>
        </motion.div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="flex items-center gap-[4.267vw] tablet:gap-[2vw] desktop:gap-[0.833vw] mt-[8.533vw] tablet:mt-[4vw] desktop:mt-[1.667vw]"
        >
          <Link
            href="https://linkedin.com/in/youssef-nesafe"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-accent-cyan hover:scale-110 active:scale-95 transition-all"
            aria-label="LinkedIn"
          >
            <FiLinkedin className="w-[5.333vw] h-[5.333vw] tablet:w-[2.5vw] tablet:h-[2.5vw] desktop:w-[1.042vw] desktop:h-[1.042vw]" />
          </Link>
          <a
            href="mailto:ynessafe@gmail.com"
            className="text-text-muted hover:text-accent-cyan hover:scale-110 active:scale-95 transition-all"
            aria-label="Email"
          >
            <FiMail className="w-[5.333vw] h-[5.333vw] tablet:w-[2.5vw] tablet:h-[2.5vw] desktop:w-[1.042vw] desktop:h-[1.042vw]" />
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          style={{ opacity: scrollIndicatorOpacity, y: scrollIndicatorY }}
          className="mt-[10.667vw] tablet:mt-[5vw] desktop:mt-[2.604vw] flex flex-col items-center gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw]"
        >
          <span className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-text-muted">
            {props.scrollHint}
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <FiChevronDown className="w-[5.333vw] h-[5.333vw] tablet:w-[2.5vw] tablet:h-[2.5vw] desktop:w-[1.042vw] desktop:h-[1.042vw] text-accent-cyan" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

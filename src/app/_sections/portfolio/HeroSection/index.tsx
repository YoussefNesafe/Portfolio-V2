"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiLinkedin, FiMail, FiChevronDown } from "react-icons/fi";
import {
  fadeUp,
  staggerContainer,
  defaultViewport,
} from "@/app/lib/animations";
import type { IHeroSection } from "@/app/models/Hero";
import AnimatedText from "@/app/components/ui/AnimatedText";
import GridBackground from "@/app/components/ui/GridBackground";
import GradientBlob from "@/app/components/ui/GradientBlob";
import SectionDecorations from "@/app/components/ui/FloatingElements";

export default function HeroSection(props: IHeroSection) {
  const [typewriterDone, setTypewriterDone] = useState(false);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background decorations */}
      <GridBackground />
      <GradientBlob
        color="cyan"
        className="-top-[20vw] -right-[20vw] tablet:-top-[10vw] tablet:-right-[10vw] desktop:-top-[5.208vw] desktop:-right-[5.208vw] animate-wave-glow"
      />
      <GradientBlob
        color="purple"
        className="-bottom-[20vw] -left-[20vw] tablet:-bottom-[10vw] tablet:-left-[10vw] desktop:-bottom-[5.208vw] desktop:-left-[5.208vw] animate-wave-glow"
      />
      <SectionDecorations variant="hero" />

      {/* Content */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        variants={staggerContainer}
        className="relative z-10 flex flex-col items-center text-center pt-[26.7vw] tablet:pt-0 px-[2.67vw] tablet:px-[5vw] desktop:px-[14.063vw]"
      >
        {/* Typewriter greeting */}
        <motion.div
          variants={fadeUp}
          className="mb-[4.267vw] tablet:mb-[2vw] desktop:mb-[0.833vw]"
        >
          <div className="font-mono text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] text-accent-emerald bg-bg-secondary/80 inline-block px-[3vw] py-[2.133vw] tablet:px-[2vw] tablet:py-[1vw] desktop:px-[0.833vw] desktop:py-[0.417vw] rounded-[1.333vw] tablet:rounded-[0.625vw] desktop:rounded-[0.26vw] border border-border-subtle">
            <AnimatedText
              text={props.greeting}
              speed={40}
              onComplete={() => setTypewriterDone(true)}
            />
          </div>
        </motion.div>

        {/* Name */}
        <motion.h1
          variants={fadeUp}
          className={`text-[13.333vw] tablet:text-[7.5vw] desktop:text-[3.646vw] font-bold text-text-heading transition-opacity duration-500 ${
            typewriterDone ? "opacity-100" : "opacity-0"
          }`}
        >
          {props.name}
        </motion.h1>

        {/* Title */}
        <motion.p
          variants={fadeUp}
          className={`text-[6.4vw] tablet:text-[3vw] desktop:text-[1.458vw] text-text-muted font-medium mt-[2.667vw] tablet:mt-[1.25vw] desktop:mt-[0.521vw] transition-opacity duration-500 ${
            typewriterDone ? "opacity-100" : "opacity-0"
          }`}
        >
          {props.titlePrefix}{" "}
          <span className="gradient-text font-bold">
            {props.titleHighlight}
          </span>{" "}
          {props.titleSuffix}
        </motion.p>

        {/* Tagline */}
        <motion.p
          variants={fadeUp}
          className={`text-[4.267vw] tablet:text-[2vw] desktop:text-[0.833vw] text-text-muted max-w-[160vw] tablet:max-w-[75vw] desktop:max-w-[31.25vw] mt-[4.267vw] tablet:mt-[2vw] desktop:mt-[0.833vw] transition-opacity duration-500 ${
            typewriterDone ? "opacity-100" : "opacity-0"
          }`}
        >
          {props.tagline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          className={`flex flex-col tablet:flex-row gap-[3.2vw] tablet:gap-[1.5vw] desktop:gap-[0.625vw] mt-[8.533vw] tablet:mt-[4vw] desktop:mt-[1.667vw] transition-opacity duration-500 ${
            typewriterDone ? "opacity-100" : "opacity-0"
          }`}
        >
          <a
            href={props.ctaPrimary.href}
            className="btn-gradient text-white font-medium text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] px-[6.4vw] py-[3.2vw] tablet:px-[3vw] tablet:py-[1.5vw] desktop:px-[1.25vw] desktop:py-[0.625vw] rounded-[2.133vw] tablet:rounded-[1vw] desktop:rounded-[0.417vw] text-center"
          >
            {props.ctaPrimary.label}
          </a>
          <a
            href={props.ctaSecondary.href}
            className="border border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10 font-medium text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] px-[6.4vw] py-[3.2vw] tablet:px-[3vw] tablet:py-[1.5vw] desktop:px-[1.25vw] desktop:py-[0.625vw] rounded-[2.133vw] tablet:rounded-[1vw] desktop:rounded-[0.417vw] transition-colors text-center"
          >
            {props.ctaSecondary.label}
          </a>
        </motion.div>

        {/* Social links */}
        <motion.div
          variants={fadeUp}
          className={`flex items-center gap-[4.267vw] tablet:gap-[2vw] desktop:gap-[0.833vw] mt-[8.533vw] tablet:mt-[4vw] desktop:mt-[1.667vw] transition-opacity duration-500 ${
            typewriterDone ? "opacity-100" : "opacity-0"
          }`}
        >
          <a
            href="https://linkedin.com/in/youssef-nesafe"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-accent-cyan transition-colors"
            aria-label="LinkedIn"
          >
            <FiLinkedin className="w-[5.333vw] h-[5.333vw] tablet:w-[2.5vw] tablet:h-[2.5vw] desktop:w-[1.042vw] desktop:h-[1.042vw]" />
          </a>
          <a
            href="mailto:ynessafe@gmail.com"
            className="text-text-muted hover:text-accent-cyan transition-colors"
            aria-label="Email"
          >
            <FiMail className="w-[5.333vw] h-[5.333vw] tablet:w-[2.5vw] tablet:h-[2.5vw] desktop:w-[1.042vw] desktop:h-[1.042vw]" />
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          variants={fadeUp}
          className="mt-[10.667vw] tablet:mt-[5vw] desktop:mt-[2.604vw] flex flex-col items-center gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw]"
        >
          <span className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-text-muted">
            {props.scrollHint}
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <FiChevronDown className="w-[5.333vw] h-[5.333vw] tablet:w-[2.5vw] tablet:h-[2.5vw] desktop:w-[1.042vw] desktop:h-[1.042vw] text-accent-cyan" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

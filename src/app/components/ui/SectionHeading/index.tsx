"use client";

import { motion } from "framer-motion";
import { fadeUp, defaultViewport } from "@/app/lib/animations";
import { cn } from "@/app/utils/cn";

interface SectionHeadingProps {
  label: string;
  title: string;
  className?: string;
}

export default function SectionHeading({
  label,
  title,
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      variants={fadeUp}
      className={cn(
        "mb-[10.667vw] tablet:mb-[5vw] desktop:mb-[2.604vw]",
        className
      )}
    >
      <span className="text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] font-mono text-accent-purple mb-[2.667vw] tablet:mb-[1.25vw] desktop:mb-[0.521vw] block">
        {label}
      </span>
      <h2 className="text-text-heading">
        {title}
        <span className="gradient-text">.</span>
      </h2>
      <div className="mt-[2.667vw] tablet:mt-[1.25vw] desktop:mt-[0.521vw] h-[0.533vw] tablet:h-[0.25vw] desktop:h-[0.104vw] w-[16vw] tablet:w-[7.5vw] desktop:w-[3.125vw] bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full" />
    </motion.div>
  );
}

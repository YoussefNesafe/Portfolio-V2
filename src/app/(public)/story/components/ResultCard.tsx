"use client";

import { motion } from "framer-motion";
import type { IStoryPersonality } from "@/app/models/IStoryDictionary";

interface ResultCardProps {
  personality: IStoryPersonality;
  resultTitle: string;
  onBack: () => void;
}

const GRADIENT_COLOR = "linear-gradient(135deg, #06B6D4 0%, #A855F7 100%)";

export default function ResultCard({
  personality,
  resultTitle,
  onBack,
}: ResultCardProps) {
  const isGradient = personality.color === "gradient";
  const titleStyle = isGradient
    ? {
        background: GRADIENT_COLOR,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }
    : { color: personality.color };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
    >
      <div className="text-center max-w-[85vw] tablet:max-w-[50vw] desktop:max-w-[26.042vw]">
        <p className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-text-muted uppercase tracking-widest mb-[2.667vw] tablet:mb-[1.25vw] desktop:mb-[0.521vw]">
          {resultTitle}
        </p>

        <h1
          className="text-[10.667vw] tablet:text-[6vw] desktop:text-[3.333vw] font-bold leading-[1.1] mb-[4.267vw] tablet:mb-[2vw] desktop:mb-[0.833vw]"
          style={titleStyle}
        >
          {personality.title}
        </h1>

        <p className="text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] text-foreground leading-[1.7] mb-[8.533vw] tablet:mb-[4vw] desktop:mb-[1.667vw]">
          {personality.description}
        </p>

        <button
          onClick={onBack}
          className="btn-gradient text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] font-semibold text-white px-[8.533vw] tablet:px-[4vw] desktop:px-[1.667vw] py-[3.2vw] tablet:py-[1.5vw] desktop:py-[0.625vw] rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw] cursor-pointer"
        >
          Back to Portfolio
        </button>
      </div>
    </motion.div>
  );
}

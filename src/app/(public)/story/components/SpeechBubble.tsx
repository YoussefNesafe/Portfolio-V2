"use client";

import { motion } from "framer-motion";
import { bubblePop } from "@/app/lib/animations";
import AnimatedText from "@/app/components/ui/AnimatedText";

interface SpeechBubbleProps {
  lines: string[];
  skipToEnd: boolean;
  onComplete: () => void;
  accentColor: string;
}

export default function SpeechBubble({
  lines,
  skipToEnd,
  onComplete,
  accentColor,
}: SpeechBubbleProps) {
  const fullText = lines.join(" ");

  return (
    <motion.div
      variants={bubblePop}
      initial="hidden"
      animate="visible"
      className="speech-bubble rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw] p-[4.267vw] tablet:p-[2vw] desktop:p-[0.833vw]"
      style={{ borderColor: `${accentColor}40` }}
    >
      <div className="relative z-10 text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] leading-[1.7] text-foreground">
        {skipToEnd ? (
          <span>{fullText}</span>
        ) : (
          <AnimatedText
            text={fullText}
            speed={30}
            onComplete={onComplete}
          />
        )}
      </div>
    </motion.div>
  );
}

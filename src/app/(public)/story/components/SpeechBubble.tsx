"use client";

import { motion } from "framer-motion";
import { bubblePop } from "@/app/lib/animations";
import AnimatedText from "@/app/components/ui/AnimatedText";

interface SpeechBubbleProps {
  lines: string[];
  skipToEnd: boolean;
  onComplete: () => void;
  accentColor: string;
  choice?: {
    question: string;
    options: { label: string; personality: string; followUp: string[] }[];
  };
  onChoice?: (personality: string) => void;
}

export default function SpeechBubble({
  lines,
  skipToEnd,
  onComplete,
  accentColor,
  choice,
  onChoice,
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
      {choice && onChoice && skipToEnd && (
        <div className="mt-[4.267vw] tablet:mt-[2vw] desktop:mt-[0.833vw] space-y-[2.667vw] tablet:space-y-[1.25vw] desktop:space-y-[0.521vw]">
          <p
            className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] font-semibold mb-[2.133vw] tablet:mb-[1vw] desktop:mb-[0.417vw]"
            style={{ color: accentColor }}
          >
            {choice.question}
          </p>
          {choice.options.map((opt) => (
            <button
              key={opt.personality}
              onClick={() => onChoice(opt.personality)}
              className="w-full text-left p-[3.2vw] tablet:p-[1.5vw] desktop:p-[0.625vw] rounded-[2.133vw] tablet:rounded-[1vw] desktop:rounded-[0.417vw] border border-border-subtle bg-bg-secondary/50 hover:bg-bg-tertiary/50 transition-colors text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-foreground cursor-pointer"
              style={{ borderColor: `${accentColor}30` }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

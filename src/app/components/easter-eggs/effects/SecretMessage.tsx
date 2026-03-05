"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

interface SecretMessageProps {
  onDismiss: () => void;
}

export default function SecretMessage({ onDismiss }: SecretMessageProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Secret message"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/60 backdrop-blur-md"
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative z-10 max-w-[90vw] tablet:max-w-[50vw] desktop:max-w-[26.042vw] bg-bg-secondary/90 backdrop-blur-lg border border-accent-cyan/30 rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw] p-[6.4vw] tablet:p-[3vw] desktop:p-[1.25vw] text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[5.333vw] tablet:text-[2.5vw] desktop:text-[1.042vw] mb-[2.667vw] tablet:mb-[1.25vw] desktop:mb-[0.521vw]">
          🎉
        </p>
        <h2 className="text-[4.267vw] tablet:text-[2vw] desktop:text-[0.833vw] font-bold text-text-heading mb-[2.667vw] tablet:mb-[1.25vw] desktop:mb-[0.521vw]">
          You cracked the code!
        </h2>
        <p className="text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] text-text-muted leading-relaxed">
          Here&apos;s a secret: I built this entire portfolio with Next.js,
          React &amp; TypeScript. Feel free to explore the source.
        </p>
        <button
          onClick={onDismiss}
          className="mt-[4.267vw] tablet:mt-[2vw] desktop:mt-[0.833vw] text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-accent-cyan hover:text-accent-cyan/80 transition-colors cursor-pointer"
        >
          Press Escape or click to close
        </button>
      </motion.div>
    </div>
  );
}

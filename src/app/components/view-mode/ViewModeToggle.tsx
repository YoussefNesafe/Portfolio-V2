"use client";

import { motion } from "framer-motion";
import { useViewMode } from "./ViewModeContext";
import { FiPenTool, FiTerminal } from "react-icons/fi";

export default function ViewModeToggle() {
  const { mode, toggleMode } = useViewMode();
  const isDev = mode === "dev";

  return (
    <div className="fixed bottom-[4.267vw] tablet:bottom-[2vw] desktop:bottom-[0.833vw] left-1/2 -translate-x-1/2 z-40">
      <button
        onClick={toggleMode}
        className="relative flex items-center bg-bg-secondary/90 backdrop-blur-lg border border-border-subtle rounded-full p-[1.067vw] tablet:p-[0.5vw] desktop:p-[0.208vw] cursor-pointer"
        aria-label={`Switch to ${isDev ? "designer" : "developer"} mode`}
      >
        {/* Sliding indicator */}
        <motion.div
          className="absolute top-[1.067vw] tablet:top-[0.5vw] desktop:top-[0.208vw] h-[8.533vw] tablet:h-[4vw] desktop:h-[1.667vw] w-[8.533vw] tablet:w-[4vw] desktop:w-[1.667vw] bg-accent-cyan/20 border border-accent-cyan/40 rounded-full"
          animate={{ x: isDev ? "100%" : "0%" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />

        {/* Designer icon */}
        <div
          className={`relative z-10 flex items-center justify-center w-[8.533vw] h-[8.533vw] tablet:w-[4vw] tablet:h-[4vw] desktop:w-[1.667vw] desktop:h-[1.667vw] rounded-full transition-colors ${
            !isDev ? "text-accent-cyan" : "text-text-muted"
          }`}
        >
          <FiPenTool className="w-[4.267vw] h-[4.267vw] tablet:w-[2vw] tablet:h-[2vw] desktop:w-[0.833vw] desktop:h-[0.833vw]" />
        </div>

        {/* Dev icon */}
        <div
          className={`relative z-10 flex items-center justify-center w-[8.533vw] h-[8.533vw] tablet:w-[4vw] tablet:h-[4vw] desktop:w-[1.667vw] desktop:h-[1.667vw] rounded-full transition-colors ${
            isDev ? "text-accent-cyan" : "text-text-muted"
          }`}
        >
          <FiTerminal className="w-[4.267vw] h-[4.267vw] tablet:w-[2vw] tablet:h-[2vw] desktop:w-[0.833vw] desktop:h-[0.833vw]" />
        </div>
      </button>
    </div>
  );
}

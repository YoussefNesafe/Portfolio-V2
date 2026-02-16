"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LoadingBarProps {
  isPending: boolean;
}

export function LoadingBar({ isPending }: LoadingBarProps) {
  return (
    <AnimatePresence>
      {isPending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="h-[0.533vw] tablet:h-[0.25vw] desktop:h-[0.104vw] w-full rounded-full overflow-hidden bg-border-subtle/30"
        >
          <motion.div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple"
            animate={{ x: ["-100%", "400%"] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

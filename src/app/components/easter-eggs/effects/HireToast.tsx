"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface HireToastProps {
  onDismiss: () => void;
  autoDismissMs?: number;
}

export default function HireToast({
  onDismiss,
  autoDismissMs = 4000,
}: HireToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [onDismiss, autoDismissMs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, x: 0 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed bottom-[4.267vw] right-[4.267vw] tablet:bottom-[2vw] tablet:right-[2vw] desktop:bottom-[0.833vw] desktop:right-[0.833vw] z-50 bg-bg-secondary/90 backdrop-blur-lg border border-accent-cyan/30 rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw] p-[4.267vw] tablet:p-[2vw] desktop:p-[0.833vw] cursor-pointer"
      onClick={onDismiss}
    >
      <p className="text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] font-medium text-text-heading">
        Great choice! Let&apos;s talk 🚀
      </p>
      <Link
        href="#contact"
        onClick={onDismiss}
        className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-accent-cyan hover:text-accent-cyan/80 transition-colors mt-[1.333vw] tablet:mt-[0.625vw] desktop:mt-[0.26vw] inline-block"
      >
        Go to contact →
      </Link>
    </motion.div>
  );
}

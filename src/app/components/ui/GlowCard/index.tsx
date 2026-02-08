"use client";

import { motion } from "framer-motion";
import { cn } from "@/app/utils/cn";
import { fadeUp } from "@/app/lib/animations";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "cyan" | "purple";
}

export default function GlowCard({
  children,
  className,
  glowColor = "cyan",
}: GlowCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        "rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw]",
        "border border-border-subtle bg-bg-secondary",
        "p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw]",
        "transition-all duration-300",
        glowColor === "cyan"
          ? "hover:border-accent-cyan/30 hover:glow-cyan"
          : "hover:border-accent-purple/30 hover:glow-purple",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

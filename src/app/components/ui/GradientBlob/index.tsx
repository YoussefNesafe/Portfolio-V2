"use client";

import { cn } from "@/app/utils/cn";

interface GradientBlobProps {
  className?: string;
  color?: "cyan" | "purple";
}

export default function GradientBlob({
  className,
  color = "cyan",
}: GradientBlobProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute rounded-full blur-[26.7vw] tablet:blur-[12.5vw] desktop:blur-[10vw] opacity-10",
        "w-[80vw] h-[80vw] tablet:w-[40vw] tablet:h-[40vw] desktop:w-[18vw] desktop:h-[18vw]",
        color === "cyan" ? "bg-accent-cyan/40" : "bg-accent-purple/40",
        className,
      )}
    />
  );
}

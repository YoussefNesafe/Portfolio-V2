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
        "pointer-events-none absolute rounded-full blur-[21.36vw] tablet:blur-[15vw] desktop:blur-[10.4vw] opacity-10",
        "w-[40.05vw] h-[40.05vw] tablet:w-[31.25vw] tablet:h-[31.25vw] desktop:w-[15.6vw] desktop:h-[15.6vw]",
        color === "cyan" ? "bg-accent-cyan/40" : "bg-accent-purple/40",
        className,
      )}
    />
  );
}

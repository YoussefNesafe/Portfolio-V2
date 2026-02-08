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
        "pointer-events-none absolute rounded-full blur-[100px] opacity-20",
        "w-[80vw] h-[80vw] tablet:w-[40vw] tablet:h-[40vw] desktop:w-[20.833vw] desktop:h-[20.833vw]",
        color === "cyan" ? "bg-accent-cyan" : "bg-accent-purple",
        className
      )}
    />
  );
}

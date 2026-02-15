"use client";

import { cn } from "@/app/utils/cn";

interface TerminalProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export default function Terminal({
  children,
  className,
  title = "terminal",
}: TerminalProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw]",
        "border border-border-subtle bg-bg-secondary",
        className
      )}
    >
      {/* Title bar */}
      <div className="flex items-center gap-[2.133vw] tablet:gap-[1vw] desktop:gap-[0.417vw] bg-bg-tertiary px-[4.267vw] py-[2.667vw] tablet:px-[2vw] tablet:py-[1.25vw] desktop:px-[0.833vw] desktop:py-[0.521vw]">
        <div className="flex gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw]" aria-hidden="true">
          <div className="w-[2.667vw] h-[2.667vw] tablet:w-[1.25vw] tablet:h-[1.25vw] desktop:w-[0.521vw] desktop:h-[0.521vw] rounded-full bg-[#FF5F57]" />
          <div className="w-[2.667vw] h-[2.667vw] tablet:w-[1.25vw] tablet:h-[1.25vw] desktop:w-[0.521vw] desktop:h-[0.521vw] rounded-full bg-[#FFBD2E]" />
          <div className="w-[2.667vw] h-[2.667vw] tablet:w-[1.25vw] tablet:h-[1.25vw] desktop:w-[0.521vw] desktop:h-[0.521vw] rounded-full bg-[#28CA41]" />
        </div>
        <span className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-text-muted font-mono">{title}</span>
      </div>
      {/* Content */}
      <div className="p-[4.267vw] tablet:p-[2vw] desktop:p-[0.833vw] font-mono text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] leading-[1.8]">
        {children}
      </div>
    </div>
  );
}

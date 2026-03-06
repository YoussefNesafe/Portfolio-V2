"use client";

import type { IStoryNav, IStoryChapter } from "@/app/models/IStoryDictionary";

interface StoryNavProps {
  nav: IStoryNav;
  chapters: IStoryChapter[];
  chapterIndex: number;
  panelIndex: number;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  accentColor: string;
}

export default function StoryNav({
  nav,
  chapters,
  chapterIndex,
  onNext,
  onBack,
  isFirst,
  isLast,
  accentColor,
}: StoryNavProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <button
        onClick={onBack}
        disabled={isFirst}
        className="px-[4.267vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[2.133vw] tablet:py-[1vw] desktop:py-[0.417vw] rounded-[1.6vw] tablet:rounded-[0.75vw] desktop:rounded-[0.313vw] border border-border-subtle text-text-muted text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:not-disabled:border-accent-cyan/40 hover:not-disabled:text-foreground"
      >
        {nav.back}
      </button>

      <div className="flex gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw]">
        {chapters.map((ch, i) => (
          <div
            key={ch.id}
            className="w-[2.133vw] h-[2.133vw] tablet:w-[1vw] tablet:h-[1vw] desktop:w-[0.417vw] desktop:h-[0.417vw] rounded-full transition-all"
            style={{
              background: i === chapterIndex ? accentColor : `${accentColor}30`,
              boxShadow: i === chapterIndex ? `0 0 8px ${accentColor}60` : "none",
            }}
          />
        ))}
      </div>

      <button
        onClick={onNext}
        className="px-[4.267vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[2.133vw] tablet:py-[1vw] desktop:py-[0.417vw] rounded-[1.6vw] tablet:rounded-[0.75vw] desktop:rounded-[0.313vw] text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] font-medium transition-all cursor-pointer"
        style={{
          background: `${accentColor}20`,
          color: accentColor,
          border: `1px solid ${accentColor}40`,
        }}
      >
        {isLast ? nav.finish : nav.next}
      </button>
    </div>
  );
}

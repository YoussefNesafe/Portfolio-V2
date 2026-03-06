"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { IStoryDictionary } from "@/app/models/IStoryDictionary";
import { useStoryState } from "@/app/hooks/useStoryState";
import StoryChapter from "./StoryChapter";
import StoryNav from "./StoryNav";
import StoryProgress from "./StoryProgress";
import ChapterTransition from "./ChapterTransition";
import ResultCard from "./ResultCard";

const COLOR_MAP: Record<string, string> = {
  cyan: "#06B6D4",
  purple: "#A855F7",
  emerald: "#10B981",
};

interface StoryPageProps {
  story: IStoryDictionary;
}

export default function StoryPage({ story }: StoryPageProps) {
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (!desktop) router.push("/");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [router]);

  const {
    chapterIndex,
    panelIndex,
    narrationComplete,
    isTransitioning,
    direction,
    currentChapter,
    totalPanels,
    globalPanelIndex,
    selectedChoice,
    showResult,
    goNext,
    goBack,
    makeChoice,
    onNarrationComplete,
    onTransitionEnd,
    computeResult,
  } = useStoryState(story.chapters);

  if (!isDesktop) return null;

  const accentColor = COLOR_MAP[currentChapter.color] || COLOR_MAP.cyan;
  const isFirst = chapterIndex === 0 && panelIndex === 0;
  const isLast =
    chapterIndex === story.chapters.length - 1 &&
    panelIndex === currentChapter.panels.length - 1 &&
    narrationComplete;

  const currentPanel = currentChapter.panels[panelIndex];
  const isChoicePanel = !!currentPanel.choice && !selectedChoice;
  const resultPersonality = computeResult(story.personalities);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StoryProgress
        current={globalPanelIndex}
        total={totalPanels}
        accentColor={accentColor}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-[4.267vw] tablet:px-[5vw] desktop:px-[14.063vw] py-[16vw] tablet:py-[8vw] desktop:py-[4.167vw]">
        <StoryChapter
          chapter={currentChapter}
          panelIndex={panelIndex}
          direction={direction}
          accentColor={accentColor}
          narrationComplete={narrationComplete}
          onNarrationComplete={onNarrationComplete}
          onChoice={makeChoice}
          selectedChoice={selectedChoice}
        />

        {!isChoicePanel && (
          <div className="mt-[6.4vw] tablet:mt-[3vw] desktop:mt-[1.25vw] w-full max-w-[90vw] tablet:max-w-[60vw] desktop:max-w-[41.667vw]">
            <StoryNav
              nav={story.nav}
              chapters={story.chapters}
              chapterIndex={chapterIndex}
              panelIndex={panelIndex}
              onNext={goNext}
              onBack={goBack}
              isFirst={isFirst}
              isLast={isLast}
              accentColor={accentColor}
            />
          </div>
        )}
      </div>

      <ChapterTransition
        isActive={isTransitioning}
        title={
          chapterIndex < story.chapters.length - 1
            ? story.chapters[chapterIndex + 1].title
            : ""
        }
        subtitle={
          chapterIndex < story.chapters.length - 1
            ? story.chapters[chapterIndex + 1].subtitle
            : ""
        }
        accentColor={
          chapterIndex < story.chapters.length - 1
            ? COLOR_MAP[story.chapters[chapterIndex + 1].color] || COLOR_MAP.cyan
            : accentColor
        }
        onComplete={onTransitionEnd}
      />

      {showResult && resultPersonality && (
        <ResultCard
          personality={resultPersonality}
          resultTitle={story.result.title}
          onBack={() => router.push("/")}
        />
      )}
    </div>
  );
}

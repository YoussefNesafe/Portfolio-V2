"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { IStoryChapter } from "@/app/models/IStoryDictionary";

export type Direction = "forward" | "back";

interface StoryState {
  chapterIndex: number;
  panelIndex: number;
  narrationComplete: boolean;
  isTransitioning: boolean;
  direction: Direction;
}

export function useStoryState(chapters: IStoryChapter[]) {
  const router = useRouter();
  const [state, setState] = useState<StoryState>({
    chapterIndex: 0,
    panelIndex: 0,
    narrationComplete: false,
    isTransitioning: false,
    direction: "forward",
  });

  const currentChapter = chapters[state.chapterIndex];
  const totalPanels = chapters.reduce((sum, ch) => sum + ch.panels.length, 0);
  const panelsBefore = chapters
    .slice(0, state.chapterIndex)
    .reduce((sum, ch) => sum + ch.panels.length, 0);
  const globalPanelIndex = panelsBefore + state.panelIndex;

  const skipNarration = useCallback(() => {
    setState((prev) => ({ ...prev, narrationComplete: true }));
  }, []);

  const onNarrationComplete = useCallback(() => {
    setState((prev) => ({ ...prev, narrationComplete: true }));
  }, []);

  const goNext = useCallback(() => {
    const chapter = chapters[state.chapterIndex];
    const hasMorePanels = state.panelIndex < chapter.panels.length - 1;
    const hasMoreChapters = state.chapterIndex < chapters.length - 1;

    if (hasMorePanels) {
      setState((prev) => ({
        ...prev,
        panelIndex: prev.panelIndex + 1,
        narrationComplete: false,
        direction: "forward" as Direction,
      }));
      return;
    }

    if (hasMoreChapters) {
      setState((prev) => ({
        ...prev,
        isTransitioning: true,
        direction: "forward" as Direction,
      }));
      return;
    }

    // Story complete — navigate home
    router.push("/");
  }, [chapters, state.chapterIndex, state.panelIndex, router]);

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.panelIndex > 0) {
        return {
          ...prev,
          panelIndex: prev.panelIndex - 1,
          narrationComplete: false,
          direction: "back" as Direction,
        };
      }

      if (prev.chapterIndex > 0) {
        const prevChapter = chapters[prev.chapterIndex - 1];
        return {
          ...prev,
          chapterIndex: prev.chapterIndex - 1,
          panelIndex: prevChapter.panels.length - 1,
          narrationComplete: false,
          direction: "back" as Direction,
        };
      }

      return prev;
    });
  }, [chapters]);

  const onTransitionEnd = useCallback(() => {
    setState((prev) => ({
      ...prev,
      chapterIndex: prev.chapterIndex + 1,
      panelIndex: 0,
      narrationComplete: false,
      isTransitioning: false,
    }));
  }, []);

  return {
    ...state,
    currentChapter,
    totalPanels,
    globalPanelIndex,
    goNext,
    goBack,
    skipNarration,
    onNarrationComplete,
    onTransitionEnd,
  };
}

"use client";

import { useState, useCallback } from "react";
import type { IStoryChapter, IStoryPersonality } from "@/app/models/IStoryDictionary";

export type Direction = "forward" | "back";

interface StoryState {
  chapterIndex: number;
  panelIndex: number;
  narrationComplete: boolean;
  isTransitioning: boolean;
  direction: Direction;
  choices: string[];
  showResult: boolean;
}

export function useStoryState(chapters: IStoryChapter[]) {
  const [state, setState] = useState<StoryState>({
    chapterIndex: 0,
    panelIndex: 0,
    narrationComplete: false,
    isTransitioning: false,
    direction: "forward",
    choices: [],
    showResult: false,
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

  const makeChoice = useCallback((personality: string) => {
    setState((prev) => ({
      ...prev,
      choices: [...prev.choices, personality],
      panelIndex: prev.panelIndex + 1,
      narrationComplete: false,
      direction: "forward" as Direction,
    }));
  }, []);

  const selectedChoice = state.choices[state.chapterIndex] ?? null;

  const computeResult = useCallback(
    (personalities: IStoryPersonality[]): IStoryPersonality | null => {
      if (state.choices.length === 0) return null;
      const counts: Record<string, number> = {};
      state.choices.forEach((id) => {
        counts[id] = (counts[id] || 0) + 1;
      });
      let maxCount = 0;
      let winnerId = state.choices[state.choices.length - 1];
      for (const [id, count] of Object.entries(counts)) {
        if (count > maxCount) {
          maxCount = count;
          winnerId = id;
        }
      }
      return personalities.find((p) => p.id === winnerId) || null;
    },
    [state.choices]
  );

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

    // Story complete — show result
    setState((prev) => ({ ...prev, showResult: true }));
  }, [chapters, state.chapterIndex, state.panelIndex]);

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
    selectedChoice,
    goNext,
    goBack,
    skipNarration,
    onNarrationComplete,
    onTransitionEnd,
    makeChoice,
    computeResult,
  };
}

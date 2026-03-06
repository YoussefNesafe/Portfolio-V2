"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { IStoryChapter } from "@/app/models/IStoryDictionary";
import { panelSlideIn, panelSlideBack } from "@/app/lib/animations";
import type { Direction } from "@/app/hooks/useStoryState";
import ComicPanel from "./ComicPanel";

interface StoryChapterProps {
  chapter: IStoryChapter;
  panelIndex: number;
  direction: Direction;
  accentColor: string;
  narrationComplete: boolean;
  onNarrationComplete: () => void;
}

export default function StoryChapter({
  chapter,
  panelIndex,
  direction,
  accentColor,
  narrationComplete,
  onNarrationComplete,
}: StoryChapterProps) {
  const panel = chapter.panels[panelIndex];
  const variants = direction === "forward" ? panelSlideIn : panelSlideBack;

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-[4.267vw] tablet:mb-[2vw] desktop:mb-[0.833vw]"
      >
        <h2
          className="text-[6.4vw] tablet:text-[3vw] desktop:text-[1.563vw] font-bold"
          style={{ color: accentColor }}
        >
          {chapter.title}
        </h2>
        <p className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-text-muted mt-[0.533vw] tablet:mt-[0.25vw] desktop:mt-[0.104vw]">
          {chapter.subtitle}
        </p>
      </motion.div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${chapter.id}-${panelIndex}`}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {panel.layout === "full" && (
            <ComicPanel
              panel={panel}
              accentColor={accentColor}
              skipToEnd={narrationComplete}
              onNarrationComplete={onNarrationComplete}
            />
          )}
          {panel.layout === "split" && (
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-[2.667vw] tablet:gap-[1.25vw] desktop:gap-[0.521vw]">
              <ComicPanel
                panel={panel}
                accentColor={accentColor}
                skipToEnd={narrationComplete}
                onNarrationComplete={onNarrationComplete}
              />
              <div
                className="comic-panel rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw] min-h-[40vw] tablet:min-h-[18.75vw] desktop:min-h-[10.417vw] flex items-center justify-center"
                style={{ borderColor: `${accentColor}40` }}
              >
                <div className="halftone-overlay absolute inset-0 rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw]" />
              </div>
            </div>
          )}
          {panel.layout === "triple" && (
            <div className="grid grid-cols-1 tablet:grid-cols-3 gap-[2.667vw] tablet:gap-[1.25vw] desktop:gap-[0.521vw]">
              <ComicPanel
                panel={panel}
                accentColor={accentColor}
                skipToEnd={narrationComplete}
                onNarrationComplete={onNarrationComplete}
              />
              <div
                className="comic-panel rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw] min-h-[40vw] tablet:min-h-[18.75vw] desktop:min-h-[10.417vw] flex items-center justify-center relative"
                style={{ borderColor: `${accentColor}40` }}
              >
                <div className="halftone-overlay absolute inset-0 rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw]" />
              </div>
              <div
                className="comic-panel rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw] min-h-[40vw] tablet:min-h-[18.75vw] desktop:min-h-[10.417vw] flex items-center justify-center relative"
                style={{ borderColor: `${accentColor}40` }}
              >
                <div className="halftone-overlay absolute inset-0 rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw]" />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

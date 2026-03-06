"use client";

import { useMemo } from "react";
import type { IStoryPanel } from "@/app/models/IStoryDictionary";
import SpeechBubble from "./SpeechBubble";
import PanelVisual from "./PanelVisual";

function hashToRotation(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return ((hash % 100) / 100) * 1 - 0.5;
}

interface ComicPanelProps {
  panel: IStoryPanel;
  accentColor: string;
  skipToEnd: boolean;
  onNarrationComplete: () => void;
  onChoice?: (personality: string) => void;
}

export default function ComicPanel({
  panel,
  accentColor,
  skipToEnd,
  onNarrationComplete,
  onChoice,
}: ComicPanelProps) {
  const rotation = hashToRotation(panel.visual + panel.layout);

  const backgroundElement = useMemo(() => {
    switch (panel.background) {
      case "grid":
        return (
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `linear-gradient(${accentColor}20 1px, transparent 1px), linear-gradient(90deg, ${accentColor}20 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          />
        );
      case "dots":
        return (
          <div className="absolute inset-0 halftone-overlay" />
        );
      case "gradient":
        return (
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              background: `radial-gradient(ellipse at 30% 50%, ${accentColor}30 0%, transparent 70%)`,
            }}
          />
        );
      default:
        return null;
    }
  }, [panel.background, accentColor]);

  return (
    <div
      className="comic-panel rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw] p-[4.267vw] tablet:p-[2vw] desktop:p-[0.833vw] flex flex-col gap-[4.267vw] tablet:gap-[2vw] desktop:gap-[0.833vw] min-h-[53.333vw] tablet:min-h-[25vw] desktop:min-h-[15.625vw] relative"
      style={{
        transform: `rotate(${rotation}deg)`,
        borderColor: `${accentColor}40`,
      }}
    >
      {backgroundElement}

      <div className="relative z-10 flex-1 flex items-center justify-center">
        <PanelVisual visual={panel.visual} accentColor={accentColor} />
      </div>

      <div className="relative z-10">
        <SpeechBubble
          lines={panel.narration}
          skipToEnd={skipToEnd}
          onComplete={onNarrationComplete}
          accentColor={accentColor}
          choice={panel.choice}
          onChoice={onChoice}
        />
      </div>
    </div>
  );
}

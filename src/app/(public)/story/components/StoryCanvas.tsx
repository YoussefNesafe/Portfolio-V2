"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { IStoryDictionary } from "@/app/models/IStoryDictionary";
import { usePlayerInput } from "../game/usePlayerInput";
import { useGameLoop } from "../game/useGameLoop";

interface StoryCanvasProps {
  story: IStoryDictionary;
}

export default function StoryCanvas({ story }: StoryCanvasProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = usePlayerInput();
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const gameState = useGameLoop(canvasRef, keysRef, story.biomes);

  // Desktop-only check
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

  // Canvas resize handler — depends on isDesktop so it runs after canvas mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0A0A0F]">
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Start prompt overlay */}
      <StartOverlay gameState={gameState} startPrompt={story.startPrompt} />

      {/* End screen overlay */}
      <EndOverlay
        gameState={gameState}
        endMessage={story.endMessage}
        onBack={() => router.push("/")}
      />
    </div>
  );
}

// Separate components that re-render based on gameState changes
// Since gameState is a ref (doesn't trigger re-renders), we use a polling approach
// with requestAnimationFrame to check state

function StartOverlay({
  gameState,
  startPrompt,
}: {
  gameState: React.RefObject<{ started: boolean }>;
  startPrompt: string;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let rafId: number;
    const check = () => {
      if (gameState.current?.started) {
        setVisible(false);
      } else {
        rafId = requestAnimationFrame(check);
      }
    };
    rafId = requestAnimationFrame(check);
    return () => cancelAnimationFrame(rafId);
  }, [gameState]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <p
        className="text-[1.25vw] text-[#FFD700] animate-pulse"
        style={{ fontFamily: "monospace" }}
      >
        {startPrompt}
      </p>
    </div>
  );
}

function EndOverlay({
  gameState,
  endMessage,
  onBack,
}: {
  gameState: React.RefObject<{ finished: boolean }>;
  endMessage: string[];
  onBack: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let rafId: number;
    const check = () => {
      if (gameState.current?.finished) {
        setVisible(true);
      } else {
        rafId = requestAnimationFrame(check);
      }
    };
    rafId = requestAnimationFrame(check);
    return () => cancelAnimationFrame(rafId);
  }, [gameState]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0A0F]/80 backdrop-blur-sm">
      {endMessage.map((line, i) => (
        <p
          key={i}
          className={`mb-[0.833vw] ${i === 0 ? "text-[2vw] text-[#FFD700] font-bold" : "text-[0.833vw] text-foreground"}`}
          style={{ fontFamily: "monospace" }}
        >
          {line}
        </p>
      ))}
      <button
        onClick={onBack}
        className="mt-[1.667vw] btn-gradient text-[0.729vw] font-semibold text-white px-[1.667vw] py-[0.625vw] rounded-[0.521vw] cursor-pointer"
      >
        Back to Portfolio
      </button>
    </div>
  );
}

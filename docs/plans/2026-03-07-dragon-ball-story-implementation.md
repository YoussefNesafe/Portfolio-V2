# Dragon Ball Story Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the comic-panel story mode with a Dragon Ball-themed 2D side-scrolling pixel art experience where a character named Youssef walks through a continuous parallax landscape using arrow keys.

**Architecture:** HTML Canvas rendered inside a React component. A game loop (requestAnimationFrame) handles input, physics, and rendering. The world is a long horizontal strip with 5 parallax layers and 4 biomes that blend into each other. Story text floats in the sky layer. Pixel art sprites are defined as 2D color arrays in code. All story content lives in the `en.json` dictionary.

**Tech Stack:** React 19, HTML5 Canvas, TypeScript, requestAnimationFrame game loop. No external game libraries.

---

### Task 1: Rewrite Dictionary Interfaces

**Files:**
- Modify: `src/app/models/IStoryDictionary.ts` (full rewrite)

**Step 1: Rewrite `IStoryDictionary.ts` with new interfaces**

Replace the entire file with interfaces matching the new world structure:

```typescript
export interface IStoryTextItem {
  text: string;
  x: number; // world x-position (0-1 normalized, where 0=start, 1=end)
  glow?: boolean; // ki energy glow effect on text
  size?: "normal" | "large"; // large = chapter titles
}

export interface IStoryBiome {
  id: string;
  title: string;
  startX: number; // 0-1 normalized position where biome begins
  skyGradient: [string, string]; // top, bottom colors
  groundColor: string;
  mountainColor: string;
  texts: IStoryTextItem[];
}

export interface IStoryDictionary {
  title: string;
  startPrompt: string; // "Press → to begin"
  endMessage: string[]; // final screen text lines
  biomes: IStoryBiome[];
}
```

**Step 2: Commit**

```bash
git add src/app/models/IStoryDictionary.ts
git commit -m "refactor(story): rewrite dictionary interfaces for 2D side-scroller"
```

---

### Task 2: Rewrite Dictionary Content

**Files:**
- Modify: `src/dictionaries/en.json` (story section only)

**Step 1: Replace the `"story"` section in `en.json`**

Remove all chapter/panel/choice/personality/nav/result content. Replace with Dragon Ball narrative-style biomes and floating text:

```json
"story": {
  "title": "My Story",
  "startPrompt": "Press → to begin your training",
  "endMessage": [
    "Power level: MAXIMUM",
    "Thanks for walking my path.",
    "Now, let's build something together."
  ],
  "biomes": [
    {
      "id": "origin",
      "title": "The Origin Saga",
      "startX": 0,
      "skyGradient": ["#1a0a2e", "#FF6B00"],
      "groundColor": "#3d2817",
      "mountainColor": "#2a1f14",
      "texts": [
        { "text": "THE ORIGIN SAGA", "x": 0.02, "size": "large" },
        { "text": "Every warrior has a beginning...", "x": 0.04, "glow": true },
        { "text": "Mine started with a blinking cursor", "x": 0.07 },
        { "text": "on a dark screen.", "x": 0.09 },
        { "text": "Late nights. Endless documentation.", "x": 0.12 },
        { "text": "Stack Overflow rabbit holes.", "x": 0.14 },
        { "text": "Each bug fixed — a small victory.", "x": 0.17, "glow": true },
        { "text": "Each project — a stepping stone.", "x": 0.19 },
        { "text": "The passion became a profession.", "x": 0.22, "glow": true }
      ]
    },
    {
      "id": "arsenal",
      "title": "The Arsenal Saga",
      "startX": 0.25,
      "skyGradient": ["#0a1628", "#00BFFF"],
      "groundColor": "#1a2a3a",
      "mountainColor": "#0f1f2f",
      "texts": [
        { "text": "THE ARSENAL SAGA", "x": 0.27, "size": "large" },
        { "text": "A warrior is only as sharp as their training.", "x": 0.29, "glow": true },
        { "text": "React. Next.js. TypeScript.", "x": 0.32 },
        { "text": "The frontend trinity.", "x": 0.34 },
        { "text": "Node.js. PostgreSQL. Prisma.", "x": 0.37 },
        { "text": "The backend foundation.", "x": 0.39 },
        { "text": "Tailwind. Framer Motion.", "x": 0.42 },
        { "text": "The finishing techniques.", "x": 0.44 },
        { "text": "Skills are not just tools — they're power.", "x": 0.47, "glow": true }
      ]
    },
    {
      "id": "works",
      "title": "The Tournament Saga",
      "startX": 0.50,
      "skyGradient": ["#0a2010", "#10B981"],
      "groundColor": "#1a3020",
      "mountainColor": "#0f2015",
      "texts": [
        { "text": "THE TOURNAMENT SAGA", "x": 0.52, "size": "large" },
        { "text": "Ideas are nothing without execution.", "x": 0.54, "glow": true },
        { "text": "Every project — a battle won.", "x": 0.57 },
        { "text": "Responsive portfolios.", "x": 0.59 },
        { "text": "Complex admin dashboards.", "x": 0.61 },
        { "text": "Each one pushed the limits", "x": 0.64 },
        { "text": "of what I thought possible.", "x": 0.66 },
        { "text": "The best code tells its own story.", "x": 0.69, "glow": true }
      ]
    },
    {
      "id": "vision",
      "title": "The Final Saga",
      "startX": 0.75,
      "skyGradient": ["#0A0A0F", "#A855F7"],
      "groundColor": "#12121a",
      "mountainColor": "#0d0d15",
      "texts": [
        { "text": "THE FINAL SAGA", "x": 0.77, "size": "large" },
        { "text": "The strongest warriors never stop training.", "x": 0.79, "glow": true },
        { "text": "New frameworks emerge.", "x": 0.82 },
        { "text": "AI reshapes the battlefield.", "x": 0.84 },
        { "text": "And I adapt.", "x": 0.86, "glow": true },
        { "text": "Build software that matters.", "x": 0.89 },
        { "text": "Create experiences that resonate.", "x": 0.91 },
        { "text": "Push the craft forward...", "x": 0.94 },
        { "text": "one commit at a time.", "x": 0.96, "glow": true }
      ]
    }
  ]
}
```

**Step 2: Commit**

```bash
git add src/dictionaries/en.json
git commit -m "content(story): rewrite story as Dragon Ball narrative sagas"
```

---

### Task 3: Create Pixel Art Sprite Data

**Files:**
- Create: `src/app/(public)/story/game/sprite-data.ts`

**Step 1: Create the sprite data file**

Define Youssef's pixel art as 2D arrays. Each frame is a 32x32 grid of hex color strings (empty string = transparent). Include:

- `IDLE_FRAMES`: 2 frames (subtle breathing animation)
- `WALK_RIGHT_FRAMES`: 4 frames (walking cycle)
- `SENZU_BEAN_SPRITE`: 8x8 green bean
- `DRAGON_BALL_SPRITE`: 12x12 orange sphere with stars
- `NIMBUS_CLOUD_SPRITE`: 16x8 yellow cloud

Character wears orange gi (`#FF6B00`) with blue undershirt (`#1E40AF`), dark hair (`#1a1a2e`), skin tone (`#F4C28B`).

The file should export:
```typescript
export const IDLE_FRAMES: string[][][] = [/* 2 frames of 32x32 */];
export const WALK_RIGHT_FRAMES: string[][][] = [/* 4 frames of 32x32 */];
export const SENZU_SPRITE: string[][] = [/* 8x8 */];
export const DRAGON_BALL_SPRITE: string[][] = [/* 12x12 */];
export const NIMBUS_SPRITE: string[][] = [/* 16x8 */];
```

**Note:** Pixel art will be hand-crafted arrays. Keep the character simple — recognizable silhouette in gi, ~15 colors max. Walk animation should show alternating legs. Idle shows slight vertical shift (breathing).

**Step 2: Commit**

```bash
git add "src/app/(public)/story/game/sprite-data.ts"
git commit -m "feat(story): create pixel art sprite data for Youssef character"
```

---

### Task 4: Create World Data Module

**Files:**
- Create: `src/app/(public)/story/game/world-data.ts`

**Step 1: Create world configuration**

Define constants and decoration placement for the continuous world:

```typescript
export const WORLD_WIDTH = 12000; // total world width in pixels
export const PLAYER_SPEED = 3; // pixels per frame at full velocity
export const PLAYER_ACCEL = 0.15; // acceleration per frame
export const PLAYER_DECEL = 0.08; // deceleration (friction) per frame
export const PLAYER_Y_OFFSET = 0.72; // player vertical position (% of canvas height)

export const PARALLAX_SPEEDS = {
  sky: 0.1,
  mountains: 0.3,
  midground: 0.6,
  ground: 1.0,
  foreground: 1.2,
} as const;

export interface Decoration {
  type: "senzu" | "dragonball" | "nimbus" | "tree" | "rock" | "waterfall" | "building" | "banner" | "star";
  x: number; // world x position
  y: number; // 0-1 normalized vertical position in its layer
  layer: keyof typeof PARALLAX_SPEEDS;
  star?: number; // for dragonball: 1-7 star count
}

export const DECORATIONS: Decoration[] = [
  // Biome 1: Origin — Training Grounds
  { type: "senzu", x: 200, y: 0.6, layer: "ground" },
  { type: "rock", x: 500, y: 0.5, layer: "midground" },
  { type: "waterfall", x: 1200, y: 0.2, layer: "mountains" },
  { type: "tree", x: 800, y: 0.5, layer: "midground" },
  { type: "tree", x: 1800, y: 0.5, layer: "midground" },
  { type: "rock", x: 2200, y: 0.6, layer: "ground" },
  { type: "dragonball", x: 2500, y: 0.15, layer: "sky", star: 1 },

  // Biome 2: Arsenal — Tech Dojo
  { type: "building", x: 3500, y: 0.4, layer: "midground" },
  { type: "nimbus", x: 4000, y: 0.2, layer: "sky" },
  { type: "building", x: 4500, y: 0.4, layer: "midground" },
  { type: "dragonball", x: 5000, y: 0.1, layer: "sky", star: 2 },
  { type: "dragonball", x: 5500, y: 0.2, layer: "sky", star: 3 },

  // Biome 3: Works — Tournament Arena
  { type: "banner", x: 6500, y: 0.3, layer: "midground" },
  { type: "banner", x: 7500, y: 0.3, layer: "midground" },
  { type: "dragonball", x: 7000, y: 0.15, layer: "sky", star: 4 },
  { type: "dragonball", x: 8000, y: 0.1, layer: "sky", star: 5 },

  // Biome 4: Vision — Space
  { type: "star", x: 9500, y: 0.1, layer: "sky" },
  { type: "star", x: 10000, y: 0.2, layer: "sky" },
  { type: "star", x: 10500, y: 0.05, layer: "sky" },
  { type: "dragonball", x: 10200, y: 0.15, layer: "sky", star: 6 },
  { type: "dragonball", x: 11000, y: 0.1, layer: "sky", star: 7 },
  { type: "senzu", x: 11500, y: 0.6, layer: "ground" },
];
```

**Step 2: Commit**

```bash
git add "src/app/(public)/story/game/world-data.ts"
git commit -m "feat(story): create world data with biome decorations and constants"
```

---

### Task 5: Create Player Input Hook

**Files:**
- Create: `src/app/(public)/story/game/usePlayerInput.ts`

**Step 1: Create the input hook**

```typescript
"use client";

import { useEffect, useRef, useCallback } from "react";

interface InputState {
  left: boolean;
  right: boolean;
}

export function usePlayerInput() {
  const keys = useRef<InputState>({ left: false, right: false });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") keys.current.left = true;
    if (e.key === "ArrowRight") keys.current.right = true;
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") keys.current.left = false;
    if (e.key === "ArrowRight") keys.current.right = false;
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return keys;
}
```

**Step 2: Commit**

```bash
git add "src/app/(public)/story/game/usePlayerInput.ts"
git commit -m "feat(story): create arrow key input hook for player movement"
```

---

### Task 6: Create Parallax Renderer

**Files:**
- Create: `src/app/(public)/story/game/renderer.ts`

**Step 1: Create the rendering module**

This module contains pure functions for drawing each layer on the canvas. No React — just canvas 2D drawing functions.

Functions to implement:
- `drawSkyLayer(ctx, canvasW, canvasH, scrollX, biomes)` — gradient sky that blends between biomes based on scroll position
- `drawMountainLayer(ctx, canvasW, canvasH, scrollX, biomes)` — distant jagged mountains with biome-colored silhouettes
- `drawMidgroundLayer(ctx, canvasW, canvasH, scrollX, decorations)` — trees, buildings, banners
- `drawGroundLayer(ctx, canvasW, canvasH, scrollX, biomes)` — flat ground plane with color transitions
- `drawForegroundLayer(ctx, canvasW, canvasH, scrollX)` — grass tufts, ki particles
- `drawFloatingText(ctx, canvasW, canvasH, scrollX, texts, worldWidth)` — story text in sky layer, fade in/out based on proximity
- `drawSprite(ctx, sprite, x, y, scale)` — render a 2D pixel array at position
- `drawPlayer(ctx, frames, frameIndex, x, y, scale, facingLeft, auraColor)` — render player with aura particles
- `drawScouter(ctx, canvasW, powerLevel)` — HUD scouter in top-right
- `drawDecorations(ctx, canvasW, canvasH, scrollX, decorations, sprites)` — render decorations in their parallax layers
- `drawPowerUpFlash(ctx, canvasW, canvasH, intensity)` — white screen flash for biome transitions

Each function takes the canvas context and relevant data, draws directly. Use `PARALLAX_SPEEDS` for scroll offset calculations within each layer.

Key rendering details:
- Sky gradient: interpolate between current and next biome's `skyGradient` colors based on scroll position
- Floating text: use a pixel-style font (`ctx.font`), text fades in when within 400px of screen center, fades out beyond
- Glowing text: add `ctx.shadowBlur` and `ctx.shadowColor` with ki-yellow (`#FFD700`)
- Large text (chapter titles): rendered 2x size
- Aura: 5-8 small circles with random offset around player, colors cycling cyan/purple, semi-transparent
- Scouter: small green-tinted rectangle in top-right with power level number in pixel font

**Step 2: Commit**

```bash
git add "src/app/(public)/story/game/renderer.ts"
git commit -m "feat(story): create canvas parallax renderer with all layer drawing functions"
```

---

### Task 7: Create Game Loop Hook

**Files:**
- Create: `src/app/(public)/story/game/useGameLoop.ts`

**Step 1: Create the game loop hook**

This hook orchestrates the update/render cycle:

```typescript
"use client";

import { useRef, useEffect, useCallback } from "react";
import type { IStoryBiome } from "@/app/models/IStoryDictionary";
import { WORLD_WIDTH, PLAYER_SPEED, PLAYER_ACCEL, PLAYER_DECEL, PLAYER_Y_OFFSET, DECORATIONS } from "./world-data";
import { IDLE_FRAMES, WALK_RIGHT_FRAMES } from "./sprite-data";
import * as renderer from "./renderer";

interface GameState {
  scrollX: number;
  velocity: number;
  facingLeft: boolean;
  frameIndex: number;
  frameTick: number;
  powerLevel: number;
  powerUpFlash: number; // 0-1 intensity, decays over time
  lastBiomeIndex: number;
  started: boolean;
  finished: boolean;
}

export function useGameLoop(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  keysRef: React.RefObject<{ left: boolean; right: boolean }>,
  biomes: IStoryBiome[],
) {
  const stateRef = useRef<GameState>({
    scrollX: 0,
    velocity: 0,
    facingLeft: false,
    frameIndex: 0,
    frameTick: 0,
    powerLevel: 0,
    powerUpFlash: 0,
    lastBiomeIndex: 0,
    started: false,
    finished: false,
  });

  const update = useCallback(() => {
    const s = stateRef.current;
    const keys = keysRef.current;
    if (!keys) return;

    // Acceleration / deceleration
    if (keys.right && !s.finished) {
      s.velocity = Math.min(s.velocity + PLAYER_ACCEL, PLAYER_SPEED);
      s.facingLeft = false;
      s.started = true;
    } else if (keys.left && !s.finished) {
      s.velocity = Math.max(s.velocity - PLAYER_ACCEL, -PLAYER_SPEED);
      s.facingLeft = true;
      s.started = true;
    } else {
      // Friction
      if (s.velocity > 0) s.velocity = Math.max(s.velocity - PLAYER_DECEL, 0);
      if (s.velocity < 0) s.velocity = Math.min(s.velocity + PLAYER_DECEL, 0);
    }

    // Move
    s.scrollX = Math.max(0, Math.min(s.scrollX + s.velocity, WORLD_WIDTH));

    // Animation frame cycling
    const isMoving = Math.abs(s.velocity) > 0.1;
    s.frameTick++;
    if (isMoving) {
      if (s.frameTick % 8 === 0) {
        s.frameIndex = (s.frameIndex + 1) % WALK_RIGHT_FRAMES.length;
      }
    } else {
      if (s.frameTick % 30 === 0) {
        s.frameIndex = (s.frameIndex + 1) % IDLE_FRAMES.length;
      }
    }

    // Power level — scales with progress
    const progress = s.scrollX / WORLD_WIDTH;
    s.powerLevel = Math.floor(progress * 9001);

    // Biome transition detection — trigger power-up flash
    const currentBiomeIndex = biomes.findIndex((b, i) => {
      const next = biomes[i + 1];
      return next ? progress >= b.startX && progress < next.startX : progress >= b.startX;
    });
    if (currentBiomeIndex > s.lastBiomeIndex) {
      s.powerUpFlash = 1.0;
      s.lastBiomeIndex = currentBiomeIndex;
    }

    // Decay flash
    if (s.powerUpFlash > 0) {
      s.powerUpFlash = Math.max(0, s.powerUpFlash - 0.03);
    }

    // End detection
    if (s.scrollX >= WORLD_WIDTH) {
      s.finished = true;
    }
  }, [keysRef, biomes]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = stateRef.current;
    const w = canvas.width;
    const h = canvas.height;
    const isMoving = Math.abs(s.velocity) > 0.1;
    const frames = isMoving ? WALK_RIGHT_FRAMES : IDLE_FRAMES;

    ctx.clearRect(0, 0, w, h);

    // Draw layers back to front
    renderer.drawSkyLayer(ctx, w, h, s.scrollX, biomes);
    renderer.drawFloatingText(ctx, w, h, s.scrollX, biomes, WORLD_WIDTH);
    renderer.drawMountainLayer(ctx, w, h, s.scrollX, biomes);
    renderer.drawDecorations(ctx, w, h, s.scrollX, DECORATIONS, "sky");
    renderer.drawMidgroundLayer(ctx, w, h, s.scrollX, biomes);
    renderer.drawDecorations(ctx, w, h, s.scrollX, DECORATIONS, "midground");
    renderer.drawGroundLayer(ctx, w, h, s.scrollX, biomes);
    renderer.drawDecorations(ctx, w, h, s.scrollX, DECORATIONS, "ground");
    renderer.drawPlayer(ctx, frames, s.frameIndex, w / 2, h * PLAYER_Y_OFFSET, 3, s.facingLeft);
    renderer.drawForegroundLayer(ctx, w, h, s.scrollX);
    renderer.drawDecorations(ctx, w, h, s.scrollX, DECORATIONS, "foreground");

    // HUD
    renderer.drawScouter(ctx, w, s.powerLevel);

    // Power-up flash overlay
    if (s.powerUpFlash > 0) {
      renderer.drawPowerUpFlash(ctx, w, h, s.powerUpFlash);
    }
  }, [canvasRef, biomes]);

  useEffect(() => {
    let rafId: number;
    const loop = () => {
      update();
      render();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [update, render]);

  return stateRef;
}
```

**Step 2: Commit**

```bash
git add "src/app/(public)/story/game/useGameLoop.ts"
git commit -m "feat(story): create game loop hook with physics, animation, and rendering"
```

---

### Task 8: Create StoryCanvas Component

**Files:**
- Create: `src/app/(public)/story/components/StoryCanvas.tsx`

**Step 1: Create the main canvas component**

```typescript
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

  // Canvas resize handler
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
  }, []);

  if (!isDesktop) return null;

  const state = gameState.current;

  return (
    <div className="fixed inset-0 bg-[#0A0A0F]">
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Start prompt overlay */}
      {!state.started && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p
            className="text-[1.25vw] text-[#FFD700] animate-pulse"
            style={{ fontFamily: "monospace" }}
          >
            {story.startPrompt}
          </p>
        </div>
      )}

      {/* End screen overlay */}
      {state.finished && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0A0F]/80 backdrop-blur-sm">
          {story.endMessage.map((line, i) => (
            <p
              key={i}
              className={`text-[${i === 0 ? "2" : "0.833"}vw] ${i === 0 ? "text-[#FFD700] font-bold" : "text-foreground"} mb-[0.833vw]`}
              style={{ fontFamily: "monospace" }}
            >
              {line}
            </p>
          ))}
          <button
            onClick={() => router.push("/")}
            className="mt-[1.667vw] btn-gradient text-[0.729vw] font-semibold text-white px-[1.667vw] py-[0.625vw] rounded-[0.521vw] cursor-pointer"
          >
            Back to Portfolio
          </button>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add "src/app/(public)/story/components/StoryCanvas.tsx"
git commit -m "feat(story): create StoryCanvas component with start/end overlays"
```

---

### Task 9: Update Story Page Route

**Files:**
- Modify: `src/app/(public)/story/page.tsx`

**Step 1: Update page to use StoryCanvas**

```typescript
import { getDictionary } from "@/get-dictionary";
import StoryCanvas from "./components/StoryCanvas";

export const metadata = {
  title: "My Story | Youssef Nesafe",
  description: "A Dragon Ball-inspired journey through my career as a developer",
};

export default async function StoryRoute() {
  const dict = await getDictionary();
  return <StoryCanvas story={dict.story} />;
}
```

**Step 2: Commit**

```bash
git add "src/app/(public)/story/page.tsx"
git commit -m "refactor(story): update story page route to use StoryCanvas"
```

---

### Task 10: Update StoryButton

**Files:**
- Modify: `src/app/components/story/StoryButton.tsx`

**Step 1: Update the icon and styling for Dragon Ball theme**

Change the icon from `FiBookOpen` to a Dragon Ball-inspired star icon, update colors to DB orange/yellow:

```typescript
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function StoryButton() {
  const pathname = usePathname();

  if (pathname === "/story") return null;

  return (
    <div className="hidden desktop:block fixed bottom-[3.125vw] right-[0.833vw] z-40">
      <Link
        href="/story"
        className="flex items-center justify-center w-[2.083vw] h-[2.083vw] rounded-full bg-[#FF6B00]/10 backdrop-blur-lg border border-[#FF6B00]/30 text-[#FFD700] cursor-pointer transition-all duration-300 hover:bg-[#FF6B00]/20 hover:border-[#FF6B00]/60 hover:shadow-[0_0_12px_rgba(255,107,0,0.4)]"
        aria-label="Story Mode"
      >
        <svg viewBox="0 0 24 24" className="w-[0.833vw] h-[0.833vw]" fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <circle cx="12" cy="7" r="1.5" fill="currentColor" />
          <circle cx="12" cy="17" r="1.5" fill="currentColor" />
          <circle cx="7" cy="12" r="1.5" fill="currentColor" />
          <circle cx="17" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </Link>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/components/story/StoryButton.tsx
git commit -m "style(story): update StoryButton to Dragon Ball theme"
```

---

### Task 11: Remove Old Story Components

**Files:**
- Delete: `src/app/(public)/story/components/ComicPanel.tsx`
- Delete: `src/app/(public)/story/components/SpeechBubble.tsx`
- Delete: `src/app/(public)/story/components/PanelVisual.tsx`
- Delete: `src/app/(public)/story/components/StoryChapter.tsx`
- Delete: `src/app/(public)/story/components/StoryNav.tsx`
- Delete: `src/app/(public)/story/components/StoryProgress.tsx`
- Delete: `src/app/(public)/story/components/ChapterTransition.tsx`
- Delete: `src/app/(public)/story/components/ResultCard.tsx`
- Delete: `src/app/(public)/story/components/StoryPage.tsx`
- Delete: `src/app/hooks/useStoryState.ts`

**Step 1: Delete all old story components and hook**

```bash
rm "src/app/(public)/story/components/ComicPanel.tsx"
rm "src/app/(public)/story/components/SpeechBubble.tsx"
rm "src/app/(public)/story/components/PanelVisual.tsx"
rm "src/app/(public)/story/components/StoryChapter.tsx"
rm "src/app/(public)/story/components/StoryNav.tsx"
rm "src/app/(public)/story/components/StoryProgress.tsx"
rm "src/app/(public)/story/components/ChapterTransition.tsx"
rm "src/app/(public)/story/components/ResultCard.tsx"
rm "src/app/(public)/story/components/StoryPage.tsx"
rm "src/app/hooks/useStoryState.ts"
```

**Step 2: Commit**

```bash
git add -A
git commit -m "refactor(story): remove old comic-panel story components"
```

---

### Task 12: Clean Up Unused Animation Variants

**Files:**
- Modify: `src/app/lib/animations.ts`

**Step 1: Check if `panelSlideIn`, `panelSlideBack`, `bubblePop`, `chapterFade` are used anywhere else**

Run: `grep -r "panelSlideIn\|panelSlideBack\|bubblePop\|chapterFade" src/ --include="*.tsx" --include="*.ts" -l`

If they are only referenced in the deleted files, remove them from `animations.ts`. Keep all other animation variants (`fadeUp`, `fadeLeft`, `fadeRight`, `scaleUp`, `staggerContainer`, `fastStaggerContainer`, `defaultViewport`).

**Step 2: Commit**

```bash
git add src/app/lib/animations.ts
git commit -m "refactor: remove unused story animation variants"
```

---

### Task 13: Update IDictionary Type

**Files:**
- Verify: `src/app/models/IDictionary.ts`

**Step 1: Verify IDictionary still imports from the updated IStoryDictionary**

The import `import type { IStoryDictionary } from "./IStoryDictionary"` should still work since we rewrote the file in Task 1 but kept the same export name. No change needed unless TypeScript compilation fails.

**Step 2: Run build check**

```bash
npm run build
```

Fix any TypeScript errors that surface. The most likely issues:
- `en.json` shape not matching `IStoryDictionary` — fix the JSON
- Import paths in new files — fix any `@/` alias issues

**Step 3: Commit fixes if needed**

```bash
git add -A
git commit -m "fix(story): resolve TypeScript build errors"
```

---

### Task 14: Manual Testing and Polish

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Test in browser at `http://localhost:3000/story`**

Verify:
- Canvas fills the screen
- "Press → to begin" prompt shows
- Arrow right moves Youssef right, world scrolls left
- Arrow left moves Youssef left, world scrolls right
- Character stays center-screen
- Parallax layers move at different speeds
- Story text fades in/out as you approach
- Glowing text has ki-energy effect
- Biome colors transition smoothly
- Dragon Balls, senzu beans, nimbus cloud visible as decorations
- Scouter HUD shows increasing power level
- Power-up flash at biome transitions
- End screen appears at world's end
- "Back to Portfolio" button works
- StoryButton on homepage has DB theme
- Non-desktop redirects to homepage
- No console errors

**Step 3: Fix any visual/behavioral issues found during testing**

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(story): complete Dragon Ball 2D side-scroller story mode"
```

---

## Task Dependency Order

```
Task 1 (interfaces) → Task 2 (dictionary content)
Task 1 → Task 3 (sprite data) — needs types
Task 1 → Task 4 (world data)
Task 5 (input hook) — independent
Task 3 + 4 → Task 6 (renderer) — needs sprites + world data
Task 5 + 6 → Task 7 (game loop) — needs input + renderer
Task 7 → Task 8 (StoryCanvas) — needs game loop
Task 8 → Task 9 (page route) — needs StoryCanvas
Task 10 (StoryButton) — independent
Task 9 → Task 11 (delete old) — after new code works
Task 11 → Task 12 (clean animations) — after old files gone
Task 12 → Task 13 (build check) — verify everything compiles
Task 13 → Task 14 (testing) — final verification

Parallelizable groups:
- Tasks 1-5 have minimal dependencies (1 must come first)
- Task 10 is fully independent
```

"use client";

import { useRef, useEffect, useCallback } from "react";
import type { RefObject } from "react";
import type { IStoryBiome } from "@/app/models/IStoryDictionary";
import {
  WORLD_WIDTH,
  PLAYER_SPEED,
  PLAYER_ACCEL,
  PLAYER_DECEL,
  PLAYER_Y_OFFSET,
  DECORATIONS,
} from "./world-data";
import { IDLE_FRAMES, WALK_RIGHT_FRAMES } from "./sprite-data";
import * as renderer from "./renderer";

interface GameState {
  scrollX: number;
  velocity: number;
  facingLeft: boolean;
  frameIndex: number;
  frameTick: number;
  powerLevel: number;
  powerUpFlash: number;
  lastBiomeIndex: number;
  started: boolean;
  finished: boolean;
}

export function useGameLoop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  keysRef: RefObject<{ left: boolean; right: boolean }>,
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

    // Move — clamp to world bounds
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
      return next
        ? progress >= b.startX && progress < next.startX
        : progress >= b.startX;
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
    renderer.drawDecorations(ctx, w, h, s.scrollX, DECORATIONS, "sky");
    renderer.drawMountainLayer(ctx, w, h, s.scrollX, biomes);
    renderer.drawDecorations(ctx, w, h, s.scrollX, DECORATIONS, "mountains");
    renderer.drawMidgroundLayer(ctx, w, h, s.scrollX, biomes);
    renderer.drawDecorations(ctx, w, h, s.scrollX, DECORATIONS, "midground");
    renderer.drawFloatingText(ctx, w, h, s.scrollX, biomes, WORLD_WIDTH);
    renderer.drawGroundLayer(ctx, w, h, s.scrollX, biomes);
    renderer.drawDecorations(ctx, w, h, s.scrollX, DECORATIONS, "ground");
    const playerScale = 3;
    const spriteHeight = 32 * playerScale;
    renderer.drawPlayer(
      ctx,
      frames,
      s.frameIndex,
      w / 2 - (32 * playerScale) / 2,
      h * PLAYER_Y_OFFSET - spriteHeight,
      playerScale,
      s.facingLeft,
    );
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

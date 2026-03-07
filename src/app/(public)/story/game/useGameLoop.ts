"use client";

import { useRef, useEffect, useCallback } from "react";
import type { RefObject } from "react";
import type { IStoryBiome } from "@/app/models/IStoryDictionary";
import {
  WORLD_WIDTH,
  PLAYER_SPEED,
  SPRINT_SPEED,
  PLAYER_ACCEL,
  PLAYER_DECEL,
  PLAYER_Y_OFFSET,
  JUMP_FORCE,
  GRAVITY,
  COLLECT_RADIUS,
  DECORATIONS,
} from "./world-data";
import { IDLE_FRAMES, WALK_RIGHT_FRAMES } from "./sprite-data";
import * as renderer from "./renderer";

interface GameState {
  scrollX: number;
  velocity: number;
  jumpVelocity: number;
  jumpY: number;
  isGrounded: boolean;
  jumpCount: number; // 0 = grounded, 1 = first jump, 2 = double jump
  facingLeft: boolean;
  isSprinting: boolean;
  isCrouching: boolean;
  frameIndex: number;
  frameTick: number;
  powerLevel: number;
  powerUpFlash: number;
  lastBiomeIndex: number;
  started: boolean;
  finished: boolean;
  // Collectibles
  collectedDragonBalls: Set<number>; // star numbers collected
  collectedSenzu: number;
  collectedKiOrbs: number;
  collectedSet: Set<number>; // indices into DECORATIONS that are collected
  pickupFlash: number; // flash intensity on pickup
  pickupText: string; // text to show on pickup
  pickupTextTimer: number;
}

export function useGameLoop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  keysRef: RefObject<{ left: boolean; right: boolean; jump: boolean; sprint: boolean; down: boolean }>,
  biomes: IStoryBiome[],
) {
  const stateRef = useRef<GameState>({
    scrollX: 0,
    velocity: 0,
    jumpVelocity: 0,
    jumpY: 0,
    isGrounded: true,
    jumpCount: 0,
    facingLeft: false,
    isSprinting: false,
    isCrouching: false,
    frameIndex: 0,
    frameTick: 0,
    powerLevel: 0,
    powerUpFlash: 0,
    lastBiomeIndex: 0,
    started: false,
    finished: false,
    collectedDragonBalls: new Set(),
    collectedSenzu: 0,
    collectedKiOrbs: 0,
    collectedSet: new Set(),
    pickupFlash: 0,
    pickupText: "",
    pickupTextTimer: 0,
  });

  // Track previous jump key state for edge detection
  const prevJumpRef = useRef(false);

  const update = useCallback(() => {
    const s = stateRef.current;
    const keys = keysRef.current;
    if (!keys) return;

    // Sprint
    s.isSprinting = keys.sprint && (keys.left || keys.right) && !s.finished;

    // Crouch (only when grounded and not moving)
    s.isCrouching = keys.down && s.isGrounded && Math.abs(s.velocity) < 0.5 && !s.finished;

    const maxSpeed = s.isSprinting ? SPRINT_SPEED : PLAYER_SPEED;
    const accel = s.isSprinting ? PLAYER_ACCEL * 1.5 : PLAYER_ACCEL;

    // Acceleration / deceleration
    if (!s.isCrouching) {
      if (keys.right && !s.finished) {
        s.velocity = Math.min(s.velocity + accel, maxSpeed);
        s.facingLeft = false;
        s.started = true;
      } else if (keys.left && !s.finished) {
        s.velocity = Math.max(s.velocity - accel, -maxSpeed);
        s.facingLeft = true;
        s.started = true;
      } else {
        // Friction
        if (s.velocity > 0) s.velocity = Math.max(s.velocity - PLAYER_DECEL, 0);
        if (s.velocity < 0) s.velocity = Math.min(s.velocity + PLAYER_DECEL, 0);
      }
    } else {
      // Crouching — slow down quickly
      if (s.velocity > 0) s.velocity = Math.max(s.velocity - PLAYER_DECEL * 3, 0);
      if (s.velocity < 0) s.velocity = Math.min(s.velocity + PLAYER_DECEL * 3, 0);
    }

    // Jump — edge detection (only trigger on press, not hold)
    const jumpPressed = keys.jump && !prevJumpRef.current;
    prevJumpRef.current = keys.jump;

    if (jumpPressed && !s.finished && !s.isCrouching) {
      if (s.isGrounded) {
        // First jump
        s.jumpVelocity = JUMP_FORCE;
        s.isGrounded = false;
        s.jumpCount = 1;
        s.started = true;
      } else if (s.jumpCount === 1) {
        // Double jump — ki burst
        s.jumpVelocity = JUMP_FORCE * 0.85;
        s.jumpCount = 2;
        s.pickupFlash = 0.3; // small ki burst flash
      }
    }

    // Apply gravity
    if (!s.isGrounded) {
      s.jumpY += s.jumpVelocity;
      s.jumpVelocity += GRAVITY;
      if (s.jumpY >= 0) {
        s.jumpY = 0;
        s.jumpVelocity = 0;
        s.isGrounded = true;
        s.jumpCount = 0;
      }
    }

    // Move — clamp to world bounds
    s.scrollX = Math.max(0, Math.min(s.scrollX + s.velocity, WORLD_WIDTH));

    // Animation frame cycling
    const isMoving = Math.abs(s.velocity) > 0.1;
    s.frameTick++;
    if (isMoving) {
      const animSpeed = s.isSprinting ? 5 : 8;
      if (s.frameTick % animSpeed === 0) {
        s.frameIndex = (s.frameIndex + 1) % WALK_RIGHT_FRAMES.length;
      }
    } else {
      if (s.frameTick % 30 === 0) {
        s.frameIndex = (s.frameIndex + 1) % IDLE_FRAMES.length;
      }
    }

    // Collectible detection — check ground-layer decorations near player
    const canvasW = canvasRef.current?.width ?? 0;
    const playerWorldX = s.scrollX + canvasW / 2; // player is drawn at screen center
    for (let i = 0; i < DECORATIONS.length; i++) {
      if (s.collectedSet.has(i)) continue;
      const dec = DECORATIONS[i];
      if (dec.layer !== "ground") continue;
      if (dec.type !== "dragonball" && dec.type !== "senzu" && dec.type !== "ki_orb") continue;

      const dist = Math.abs(dec.x - playerWorldX);
      if (dist < COLLECT_RADIUS) {
        s.collectedSet.add(i);
        if (dec.type === "dragonball" && dec.star) {
          s.collectedDragonBalls.add(dec.star);
          s.pickupFlash = 0.6;
          s.pickupText = `Dragon Ball ★${dec.star} collected! (${s.collectedDragonBalls.size}/7)`;
          s.pickupTextTimer = 120;
        } else if (dec.type === "senzu") {
          s.collectedSenzu++;
          s.pickupFlash = 0.4;
          s.pickupText = "Senzu Bean! Power restored!";
          s.pickupTextTimer = 90;
          s.powerLevel = Math.min(9001, s.powerLevel + 500);
        } else if (dec.type === "ki_orb") {
          s.collectedKiOrbs++;
          s.pickupFlash = 0.15;
          s.pickupText = "";
          s.powerLevel = Math.min(9001, s.powerLevel + 50);
        }
      }
    }

    // Power level — scales with progress + collectible bonus
    const progress = s.scrollX / WORLD_WIDTH;
    const basePower = Math.floor(progress * 8000);
    const orbBonus = s.collectedKiOrbs * 50;
    const senzuBonus = s.collectedSenzu * 500;
    const dbBonus = s.collectedDragonBalls.size * 150;
    s.powerLevel = Math.min(9001, basePower + orbBonus + senzuBonus + dbBonus);

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

    // Decay flashes
    if (s.powerUpFlash > 0) {
      s.powerUpFlash = Math.max(0, s.powerUpFlash - 0.03);
    }
    if (s.pickupFlash > 0) {
      s.pickupFlash = Math.max(0, s.pickupFlash - 0.02);
    }
    if (s.pickupTextTimer > 0) {
      s.pickupTextTimer--;
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
    renderer.drawDecorations(ctx, w, h, s.scrollX, DECORATIONS, "sky", s.collectedSet);
    renderer.drawMountainLayer(ctx, w, h, s.scrollX, biomes);
    renderer.drawDecorations(ctx, w, h, s.scrollX, DECORATIONS, "mountains", s.collectedSet);
    renderer.drawMidgroundLayer(ctx, w, h, s.scrollX, biomes);
    renderer.drawDecorations(ctx, w, h, s.scrollX, DECORATIONS, "midground", s.collectedSet);
    renderer.drawFloatingText(ctx, w, h, s.scrollX, biomes, WORLD_WIDTH);
    renderer.drawGroundLayer(ctx, w, h, s.scrollX, biomes);
    renderer.drawDecorations(ctx, w, h, s.scrollX, DECORATIONS, "ground", s.collectedSet);

    const playerScale = 3;
    const spriteHeight = 32 * playerScale;
    const playerX = w / 2 - (32 * playerScale) / 2;
    const playerY = h * PLAYER_Y_OFFSET - spriteHeight + s.jumpY;
    const crouchSquish = s.isCrouching ? 0.6 : 1;

    renderer.drawPlayer(
      ctx,
      frames,
      s.frameIndex,
      playerX,
      playerY,
      playerScale,
      s.facingLeft,
      s.isSprinting,
      crouchSquish,
    );

    renderer.drawForegroundLayer(ctx, w, h, s.scrollX);
    renderer.drawDecorations(ctx, w, h, s.scrollX, DECORATIONS, "foreground", s.collectedSet);

    // HUD
    renderer.drawScouter(ctx, w, s.powerLevel, s.collectedDragonBalls.size);

    // Pickup text
    if (s.pickupTextTimer > 0 && s.pickupText) {
      renderer.drawPickupText(ctx, w, h, s.pickupText, s.pickupTextTimer);
    }

    // Power-up flash overlay
    if (s.powerUpFlash > 0) {
      renderer.drawPowerUpFlash(ctx, w, h, s.powerUpFlash);
    }
    // Pickup flash (golden)
    if (s.pickupFlash > 0) {
      renderer.drawPickupFlash(ctx, w, h, s.pickupFlash);
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

"use client";

import { useRef, useEffect, useCallback } from "react";
import type { RefObject } from "react";
import type { IStoryBiome } from "@/app/models/IStoryDictionary";
import {
  WORLD_WIDTH,
  PLAYER_Y_OFFSET,
  DECORATIONS,
  ENEMIES,
} from "./world-data";
import { IDLE_FRAMES, WALK_RIGHT_FRAMES } from "./sprite-data";
import { createInitialState } from "./game-state";
import type { GameState } from "./game-state";
import {
  BLAST_DURATION,
  WISH_DISMISS_DELAY,
  WISH_TRANSFORM_FLASH,
  ANIM_SPEED_WALK,
  ANIM_SPEED_SPRINT,
  ANIM_SPEED_IDLE,
  MOVING_THRESHOLD,
  PLAYER_SCALE,
  SPRITE_SIZE,
  CROUCH_SQUISH,
} from "./game-constants";
import * as renderer from "./renderer";
import * as sound from "./sound";
import { updateMovement } from "./update/movement";
import { updateCombat } from "./update/combat";
import { updateCollectibles } from "./update/collectibles";
import { updateEffects } from "./update/effects";
import { updateMilestones } from "./update/milestones";

function updateAnimation(s: GameState): void {
  const isMoving = Math.abs(s.movement.velocity) > MOVING_THRESHOLD;
  s.animation.frameTick++;
  if (isMoving) {
    const speed = s.movement.isSprinting ? ANIM_SPEED_SPRINT : ANIM_SPEED_WALK;
    if (s.animation.frameTick % speed === 0) {
      s.animation.frameIndex = (s.animation.frameIndex + 1) % WALK_RIGHT_FRAMES.length;
    }
  } else {
    if (s.animation.frameTick % ANIM_SPEED_IDLE === 0) {
      s.animation.frameIndex = (s.animation.frameIndex + 1) % IDLE_FRAMES.length;
    }
  }
}

export function useGameLoop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  keysRef: RefObject<{
    left: boolean; right: boolean; jump: boolean; sprint: boolean;
    down: boolean; blast: boolean; teleport: boolean;
  }>,
  biomes: IStoryBiome[],
) {
  const stateRef = useRef<GameState>(createInitialState());

  const prevJumpRef = useRef(false);
  const prevBlastRef = useRef(false);
  const prevTeleportRef = useRef(false);

  const update = useCallback(() => {
    const s = stateRef.current;
    const keys = keysRef.current;
    if (!keys) return;

    // Wish screen freezes gameplay — dismiss after delay with any key
    if (s.effects.wishActive) {
      s.effects.wishTimer++;
      if (s.effects.wishTimer > WISH_DISMISS_DELAY) {
        const anyKey = keys.left || keys.right || keys.jump || keys.sprint ||
          keys.down || keys.blast || keys.teleport;
        if (anyKey) {
          s.effects.wishActive = false;
          s.power.isSuperSaiyan = true;
          s.power.transformFlash = WISH_TRANSFORM_FLASH;
        }
      }
      return;
    }

    const canvasW = canvasRef.current?.width ?? 800;
    const canvasH = canvasRef.current?.height ?? 600;

    updateMovement(s, keys, prevJumpRef, canvasW, canvasH);
    updateCombat(s, keys, prevBlastRef, prevTeleportRef, canvasW);
    updateCollectibles(s, canvasW, canvasH);
    updateAnimation(s);
    updateMilestones(s, biomes);
    updateEffects(s, canvasW, canvasH);
  }, [keysRef, biomes, canvasRef]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = stateRef.current;
    const w = canvas.width;
    const h = canvas.height;

    // Wish screen overlay
    if (s.effects.wishActive) {
      renderer.drawWishScreen(ctx, w, h, s.effects.wishTimer);
      return;
    }

    const isMoving = Math.abs(s.movement.velocity) > MOVING_THRESHOLD;
    const frames = isMoving ? WALK_RIGHT_FRAMES : IDLE_FRAMES;

    // Screen shake offset
    ctx.save();
    if (s.effects.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * s.effects.screenShake * 2;
      const shakeY = (Math.random() - 0.5) * s.effects.screenShake * 2;
      ctx.translate(shakeX, shakeY);
    }

    ctx.clearRect(0, 0, w + 20, h + 20); // slightly larger to cover shake

    // Draw layers
    renderer.drawSkyLayer(ctx, w, h, s.movement.scrollX, biomes);
    renderer.drawDayNightTint(ctx, w, h, s.movement.scrollX);
    renderer.drawDecorations(ctx, w, h, s.movement.scrollX, DECORATIONS, "sky", s.collectibles.collectedSet);

    // Shooting stars (biome 4)
    if (s.effects.shootingStars.length > 0) {
      renderer.drawShootingStars(ctx, s.effects.shootingStars);
    }

    renderer.drawMountainLayer(ctx, w, h, s.movement.scrollX, biomes);
    renderer.drawDecorations(ctx, w, h, s.movement.scrollX, DECORATIONS, "mountains", s.collectibles.collectedSet);
    renderer.drawParallaxFog(ctx, w, h, s.movement.scrollX, biomes, "far");
    renderer.drawMidgroundLayer(ctx, w, h, s.movement.scrollX, biomes);
    renderer.drawDecorations(ctx, w, h, s.movement.scrollX, DECORATIONS, "midground", s.collectibles.collectedSet);
    renderer.drawParallaxFog(ctx, w, h, s.movement.scrollX, biomes, "mid");
    renderer.drawFloatingText(ctx, w, h, s.movement.scrollX, biomes, WORLD_WIDTH);
    renderer.drawParallaxFog(ctx, w, h, s.movement.scrollX, biomes, "near");
    renderer.drawGroundLayer(ctx, w, h, s.movement.scrollX, biomes);
    renderer.drawGroundSurface(ctx, w, h, s.movement.scrollX);
    renderer.drawDecorations(ctx, w, h, s.movement.scrollX, DECORATIONS, "ground", s.collectibles.collectedSet);

    // Enemies
    renderer.drawEnemies(ctx, w, h, s.movement.scrollX, s.combat.enemies, ENEMIES);

    const playerScale = PLAYER_SCALE;
    const spriteHeight = SPRITE_SIZE * playerScale;
    const playerX = w / 2 - (SPRITE_SIZE * playerScale) / 2;
    const playerY = h * PLAYER_Y_OFFSET - spriteHeight + s.movement.jumpY;
    const crouchSquish = s.movement.isCrouching ? CROUCH_SQUISH : 1;

    // Sprint afterimages
    if (s.effects.afterimages.length > 0) {
      renderer.drawAfterimages(ctx, w, h, s.movement.scrollX, s.effects.afterimages, frames, playerScale);
    }

    renderer.drawPlayer(
      ctx,
      frames,
      s.animation.frameIndex,
      playerX,
      playerY,
      playerScale,
      s.movement.facingLeft,
      s.movement.isSprinting,
      crouchSquish,
      s.power.isSuperSaiyan,
      s.movement.isFlying,
      s.power.transformTimer,
    );

    // Kamehameha beam
    if (s.combat.blastActive) {
      renderer.drawKamehameha(
        ctx, w, h, playerX, playerY, playerScale, s.movement.facingLeft,
        s.combat.blastTimer, BLAST_DURATION, s.power.isSuperSaiyan,
      );
    }

    // Dust particles
    if (s.effects.dustParticles.length > 0) {
      renderer.drawDustParticles(ctx, s.effects.dustParticles);
    }

    renderer.drawForegroundLayer(ctx, w, h, s.movement.scrollX);

    // Weather
    if (s.effects.weatherParticles.length > 0) {
      renderer.drawWeatherParticles(ctx, s.effects.weatherParticles);
    }

    renderer.drawDecorations(ctx, w, h, s.movement.scrollX, DECORATIONS, "foreground", s.collectibles.collectedSet);

    // HUD
    renderer.drawScouter(ctx, w, s.power.powerLevel, s.collectibles.collectedDragonBalls.size, s.combat.enemiesKilled);

    // Dragon Ball radar
    renderer.drawDragonBallRadar(ctx, w, h, s.movement.scrollX, s.collectibles.collectedSet, DECORATIONS);

    // Controls hint
    renderer.drawControlsHint(ctx, w, h);

    // Milestone text
    if (s.ui.milestoneTimer > 0 && s.ui.milestoneText) {
      renderer.drawMilestoneText(ctx, w, h, s.ui.milestoneText, s.ui.milestoneTimer);
    }

    // Pickup text
    if (s.ui.pickupTextTimer > 0 && s.ui.pickupText) {
      renderer.drawPickupText(ctx, w, h, s.ui.pickupText, s.ui.pickupTextTimer);
    }

    // Teleport flash
    if (s.combat.teleportFlash > 0) {
      renderer.drawTeleportFlash(ctx, w, h, s.combat.teleportFlash);
    }

    // Transform flash
    if (s.power.transformFlash > 0) {
      renderer.drawTransformFlash(ctx, w, h, s.power.transformFlash);
    }

    // Power-up flash
    if (s.power.powerUpFlash > 0) {
      renderer.drawPowerUpFlash(ctx, w, h, s.power.powerUpFlash);
    }
    if (s.ui.pickupFlash > 0) {
      renderer.drawPickupFlash(ctx, w, h, s.ui.pickupFlash);
    }

    ctx.restore(); // end screen shake
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

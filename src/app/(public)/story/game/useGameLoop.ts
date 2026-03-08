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
  ENEMIES,
} from "./world-data";
import { IDLE_FRAMES, WALK_RIGHT_FRAMES } from "./sprite-data";
import * as renderer from "./renderer";
import * as sound from "./sound";

interface DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface EnemyState {
  x: number;       // current world X
  dir: number;     // 1 or -1
  alive: boolean;
  deathTimer: number; // countdown for death animation
}

interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  type: "rain" | "leaf" | "snow";
}

interface Afterimage {
  x: number;       // scrollX at time of capture (world position reference)
  y: number;       // jumpY at time of capture
  frameIndex: number;
  facingLeft: boolean;
  alpha: number;
  isSuperSaiyan: boolean;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  length: number;
}

interface GameState {
  scrollX: number;
  velocity: number;
  jumpVelocity: number;
  jumpY: number;
  isGrounded: boolean;
  jumpCount: number;
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
  collectedDragonBalls: Set<number>;
  collectedSenzu: number;
  collectedKiOrbs: number;
  collectedSet: Set<number>;
  pickupFlash: number;
  pickupText: string;
  pickupTextTimer: number;
  // Kamehameha
  blastActive: boolean;
  blastTimer: number;
  // Instant Transmission
  teleportFlash: number;
  teleportCooldown: number;
  // Flying
  isFlying: boolean;
  // Super Saiyan
  isSuperSaiyan: boolean;
  transformTimer: number;
  transformFlash: number;
  transformTriggered: boolean;
  // Landing impact
  dustParticles: DustParticle[];
  screenShake: number;
  wasAirborne: boolean;
  prevJumpY: number;
  // Wish
  wishActive: boolean;
  wishTimer: number;
  // Enemies
  enemies: EnemyState[];
  enemiesKilled: number;
  // Milestones
  milestoneShown: Set<number>;
  milestoneText: string;
  milestoneTimer: number;
  // Weather
  weatherParticles: WeatherParticle[];
  // Afterimages
  afterimages: Afterimage[];
  // Shooting stars
  shootingStars: ShootingStar[];
}

const TELEPORT_DISTANCE = 200;
const TELEPORT_COOLDOWN = 90; // frames
const BLAST_DURATION = 40; // frames
const FLOAT_GRAVITY = 0.05; // reduced gravity when flying

export function useGameLoop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  keysRef: RefObject<{
    left: boolean; right: boolean; jump: boolean; sprint: boolean;
    down: boolean; blast: boolean; teleport: boolean;
  }>,
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
    blastActive: false,
    blastTimer: 0,
    teleportFlash: 0,
    teleportCooldown: 0,
    isFlying: false,
    isSuperSaiyan: false,
    transformTimer: 0,
    transformFlash: 0,
    transformTriggered: false,
    dustParticles: [],
    screenShake: 0,
    wasAirborne: false,
    prevJumpY: 0,
    wishActive: false,
    wishTimer: 0,
    enemies: ENEMIES.map((e) => ({ x: e.x, dir: 1, alive: true, deathTimer: 0 })),
    enemiesKilled: 0,
    milestoneShown: new Set(),
    milestoneText: "",
    milestoneTimer: 0,
    weatherParticles: [],
    afterimages: [],
    shootingStars: [],
  });

  const prevJumpRef = useRef(false);
  const prevBlastRef = useRef(false);
  const prevTeleportRef = useRef(false);

  const update = useCallback(() => {
    const s = stateRef.current;
    const keys = keysRef.current;
    if (!keys) return;

    // Wish screen freezes gameplay — dismiss after delay with any key
    if (s.wishActive) {
      s.wishTimer++;
      if (s.wishTimer > 180) {
        const anyKey = keys.left || keys.right || keys.jump || keys.sprint ||
          keys.down || keys.blast || keys.teleport;
        if (anyKey) {
          s.wishActive = false;
          s.isSuperSaiyan = true;
          s.transformFlash = 0.5;
        }
      }
      return;
    }

    // Sprint
    s.isSprinting = keys.sprint && (keys.left || keys.right) && !s.finished;

    // Crouch
    s.isCrouching = keys.down && s.isGrounded && Math.abs(s.velocity) < 0.5 && !s.finished;

    const ssjSpeedMult = s.isSuperSaiyan ? 1.3 : 1;
    const maxSpeed = (s.isSprinting ? SPRINT_SPEED : PLAYER_SPEED) * ssjSpeedMult;
    const accel = (s.isSprinting ? PLAYER_ACCEL * 1.5 : PLAYER_ACCEL) * ssjSpeedMult;

    // Movement
    if (!s.isCrouching && !s.blastActive) {
      if (keys.right && !s.finished) {
        s.velocity = Math.min(s.velocity + accel, maxSpeed);
        s.facingLeft = false;
        s.started = true;
      } else if (keys.left && !s.finished) {
        s.velocity = Math.max(s.velocity - accel, -maxSpeed);
        s.facingLeft = true;
        s.started = true;
      } else {
        if (s.velocity > 0) s.velocity = Math.max(s.velocity - PLAYER_DECEL, 0);
        if (s.velocity < 0) s.velocity = Math.min(s.velocity + PLAYER_DECEL, 0);
      }
    } else if (s.isCrouching) {
      if (s.velocity > 0) s.velocity = Math.max(s.velocity - PLAYER_DECEL * 3, 0);
      if (s.velocity < 0) s.velocity = Math.min(s.velocity + PLAYER_DECEL * 3, 0);
    }

    // Jump
    const jumpPressed = keys.jump && !prevJumpRef.current;
    prevJumpRef.current = keys.jump;

    if (jumpPressed && !s.finished && !s.isCrouching && !s.blastActive) {
      if (s.isGrounded) {
        s.jumpVelocity = JUMP_FORCE * (s.isSuperSaiyan ? 1.2 : 1);
        s.isGrounded = false;
        s.jumpCount = 1;
        s.started = true;
        sound.playJump();
      } else if (s.jumpCount === 1) {
        s.jumpVelocity = JUMP_FORCE * 0.85 * (s.isSuperSaiyan ? 1.2 : 1);
        s.jumpCount = 2;
        s.pickupFlash = 0.3;
        sound.playDoubleJump();
      }
    }

    // Flying — hold space while airborne to glide
    s.isFlying = keys.jump && !s.isGrounded && s.jumpCount >= 1 && !s.finished;

    // Apply gravity (reduced when flying)
    if (!s.isGrounded) {
      const grav = s.isFlying ? FLOAT_GRAVITY : GRAVITY;
      s.jumpY += s.jumpVelocity;
      s.jumpVelocity += grav;
      // Cap fall speed when flying
      if (s.isFlying && s.jumpVelocity > 1) {
        s.jumpVelocity = 1;
      }
      if (s.jumpY >= 0) {
        // Landing impact — check how far we fell
        if (s.wasAirborne && s.prevJumpY < -30) {
          s.screenShake = Math.min(8, Math.abs(s.prevJumpY) / 10);
          sound.playLanding();
          // Spawn dust particles
          const canvasW = canvasRef.current?.width ?? 800;
          const groundY = (canvasRef.current?.height ?? 600) * PLAYER_Y_OFFSET;
          const playerScreenX = canvasW / 2;
          for (let i = 0; i < 8; i++) {
            s.dustParticles.push({
              x: playerScreenX + (Math.random() - 0.5) * 30,
              y: groundY,
              vx: (Math.random() - 0.5) * 4,
              vy: -Math.random() * 2 - 0.5,
              life: 20 + Math.random() * 15,
            });
          }
        }
        s.jumpY = 0;
        s.jumpVelocity = 0;
        s.isGrounded = true;
        s.jumpCount = 0;
        s.isFlying = false;
      }
    }

    // Track airborne state for landing detection
    s.wasAirborne = !s.isGrounded;
    if (!s.isGrounded) s.prevJumpY = s.jumpY;

    // Kamehameha blast — press X
    const blastPressed = keys.blast && !prevBlastRef.current;
    prevBlastRef.current = keys.blast;

    if (blastPressed && !s.finished && !s.blastActive) {
      s.blastActive = true;
      s.blastTimer = BLAST_DURATION;
      sound.playBlast();
    }
    if (s.blastActive) {
      s.blastTimer--;
      if (s.blastTimer <= 0) {
        s.blastActive = false;
      }
    }

    // Instant Transmission — press C
    const teleportPressed = keys.teleport && !prevTeleportRef.current;
    prevTeleportRef.current = keys.teleport;

    if (teleportPressed && !s.finished && s.teleportCooldown <= 0) {
      const dir = s.facingLeft ? -1 : 1;
      s.scrollX = Math.max(0, Math.min(s.scrollX + TELEPORT_DISTANCE * dir, WORLD_WIDTH));
      s.teleportFlash = 1.0;
      s.teleportCooldown = TELEPORT_COOLDOWN;
      s.started = true;
      sound.playTeleport();
    }
    if (s.teleportCooldown > 0) s.teleportCooldown--;

    // Move
    s.scrollX = Math.max(0, Math.min(s.scrollX + s.velocity, WORLD_WIDTH));

    // Animation
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

    // Collectible detection — must overlap both X and Y (no collecting while jumping over)
    const canvasW = canvasRef.current?.width ?? 0;
    const canvasH = canvasRef.current?.height ?? 0;
    const playerWorldX = s.scrollX + canvasW / 2;
    const spriteH = 32 * 3; // playerScale = 3
    const playerFeetY = canvasH * PLAYER_Y_OFFSET + s.jumpY;
    const playerTopY = playerFeetY - spriteH;

    for (let i = 0; i < DECORATIONS.length; i++) {
      if (s.collectedSet.has(i)) continue;
      const dec = DECORATIONS[i];
      if (dec.layer !== "ground") continue;
      if (dec.type !== "dragonball" && dec.type !== "senzu" && dec.type !== "ki_orb") continue;

      const distX = Math.abs(dec.x - playerWorldX);
      const itemY = dec.y * canvasH;
      // Item must be within player's vertical body range (with tolerance)
      const yOverlap = itemY >= playerTopY - 10 && itemY <= playerFeetY + 10;

      if (distX < COLLECT_RADIUS && yOverlap) {
        s.collectedSet.add(i);
        if (dec.type === "dragonball" && dec.star) {
          s.collectedDragonBalls.add(dec.star);
          s.pickupFlash = 0.6;
          s.pickupText = `Dragon Ball ${dec.star} collected! (${s.collectedDragonBalls.size}/7)`;
          s.pickupTextTimer = 120;
          sound.playCollectDragonBall();
          // Check for wish
          if (s.collectedDragonBalls.size === 7) {
            s.wishActive = true;
            s.wishTimer = 0;
            sound.playWish();
          }
        } else if (dec.type === "senzu") {
          s.collectedSenzu++;
          s.pickupFlash = 0.4;
          s.pickupText = "Senzu Bean! Power restored!";
          s.pickupTextTimer = 90;
          s.powerLevel = Math.min(9001, s.powerLevel + 500);
          sound.playCollectSenzu();
        } else if (dec.type === "ki_orb") {
          s.collectedKiOrbs++;
          s.pickupFlash = 0.15;
          s.pickupText = "";
          s.powerLevel = Math.min(9001, s.powerLevel + 50);
          sound.playCollectOrb();
        }
      }
    }

    // Power level
    const progress = s.scrollX / WORLD_WIDTH;
    const basePower = Math.floor(progress * 8000);
    const orbBonus = s.collectedKiOrbs * 50;
    const senzuBonus = s.collectedSenzu * 500;
    const dbBonus = s.collectedDragonBalls.size * 150;
    s.powerLevel = Math.min(9001, basePower + orbBonus + senzuBonus + dbBonus);

    // Super Saiyan transformation
    if (s.powerLevel >= 9001 && !s.transformTriggered) {
      s.transformTriggered = true;
      s.isSuperSaiyan = true;
      s.transformTimer = 120; // 2 second transformation animation
      s.transformFlash = 1.0;
      s.screenShake = 10;
      sound.playTransform();
    }

    // Biome transition
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

    // Decay flashes & timers
    if (s.powerUpFlash > 0) s.powerUpFlash = Math.max(0, s.powerUpFlash - 0.03);
    if (s.pickupFlash > 0) s.pickupFlash = Math.max(0, s.pickupFlash - 0.02);
    if (s.pickupTextTimer > 0) s.pickupTextTimer--;
    if (s.teleportFlash > 0) s.teleportFlash = Math.max(0, s.teleportFlash - 0.05);
    if (s.transformTimer > 0) s.transformTimer--;
    if (s.transformFlash > 0) s.transformFlash = Math.max(0, s.transformFlash - 0.015);
    if (s.screenShake > 0) s.screenShake = Math.max(0, s.screenShake - 0.3);

    // Update dust particles
    s.dustParticles = s.dustParticles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // particle gravity
      p.life--;
      return p.life > 0;
    });

    // Footstep dust — spawn small particles when walking/sprinting on ground
    if (s.isGrounded && isMoving && s.frameTick % (s.isSprinting ? 3 : 6) === 0) {
      const groundY = canvasH * PLAYER_Y_OFFSET;
      const playerScreenX = canvasW / 2;
      const count = s.isSprinting ? 2 : 1;
      for (let i = 0; i < count; i++) {
        s.dustParticles.push({
          x: playerScreenX + (Math.random() - 0.5) * 15,
          y: groundY,
          vx: -s.velocity * 0.3 + (Math.random() - 0.5) * 1.5,
          vy: -Math.random() * 1.2 - 0.3,
          life: 12 + Math.random() * 8,
        });
      }
    }

    // Sprint afterimages — spawn ghost copy every 4 frames
    if (s.isSprinting && isMoving && s.frameTick % 4 === 0) {
      s.afterimages.push({
        x: s.scrollX,
        y: s.jumpY,
        frameIndex: s.frameIndex,
        facingLeft: s.facingLeft,
        alpha: 0.5,
        isSuperSaiyan: s.isSuperSaiyan,
      });
    }
    // Decay afterimages
    s.afterimages = s.afterimages.filter((a) => {
      a.alpha -= 0.04;
      return a.alpha > 0;
    });

    // Enemy patrol + Kamehameha collision
    for (let i = 0; i < s.enemies.length; i++) {
      const es = s.enemies[i];
      const def = ENEMIES[i];

      // Death animation countdown
      if (!es.alive) {
        if (es.deathTimer > 0) es.deathTimer--;
        continue;
      }

      // Patrol movement
      es.x += def.speed * es.dir;
      if (es.x > def.x + def.range) es.dir = -1;
      if (es.x < def.x - def.range) es.dir = 1;

      // Check Kamehameha collision
      if (s.blastActive) {
        const beamProgress = 1 - s.blastTimer / BLAST_DURATION;
        const beamLen = beamProgress * canvasW * 0.8;
        const beamStartWorldX = playerWorldX;
        const beamDir = s.facingLeft ? -1 : 1;
        const beamEndWorldX = beamStartWorldX + beamDir * beamLen;

        const enemyMinX = Math.min(beamStartWorldX, beamEndWorldX);
        const enemyMaxX = Math.max(beamStartWorldX, beamEndWorldX);

        if (es.x >= enemyMinX - 30 && es.x <= enemyMaxX + 30) {
          es.alive = false;
          es.deathTimer = 30;
          s.enemiesKilled++;
          s.powerLevel = Math.min(9001, s.powerLevel + 100);
          s.pickupText = `Enemy defeated! +100 power`;
          s.pickupTextTimer = 60;
          s.pickupFlash = 0.2;
          sound.playEnemyDefeat();
        }
      }
    }

    // Power level milestones
    const milestones: [number, string][] = [
      [1000, "Kaioken!"],
      [3000, "Kaioken x10!"],
      [5000, "Kaioken x20!"],
      [7000, "SSJ incoming...!"],
    ];
    for (const [threshold, text] of milestones) {
      if (s.powerLevel >= threshold && !s.milestoneShown.has(threshold)) {
        s.milestoneShown.add(threshold);
        s.milestoneText = text;
        s.milestoneTimer = 120;
        s.pickupFlash = 0.3;
        s.screenShake = 3;
        sound.playMilestone();
      }
    }
    if (s.milestoneTimer > 0) s.milestoneTimer--;

    // Weather particles — biome-specific
    const canvasWW = canvasRef.current?.width ?? 800;
    const canvasHW = canvasRef.current?.height ?? 600;
    const weatherBiome = progress < 0.25 ? 0 : progress < 0.5 ? 1 : progress < 0.75 ? 2 : 3;

    if (weatherBiome >= 1 && s.frameTick % 2 === 0) {
      const count = weatherBiome === 3 ? 3 : 2;
      for (let i = 0; i < count; i++) {
        const type: WeatherParticle["type"] = weatherBiome === 1 ? "rain" : weatherBiome === 2 ? "leaf" : "snow";
        s.weatherParticles.push({
          x: Math.random() * canvasWW,
          y: -5,
          vx: type === "leaf" ? (Math.random() - 0.5) * 2 : (Math.random() - 0.5) * 0.5,
          vy: type === "rain" ? 6 + Math.random() * 3 : type === "snow" ? 1 + Math.random() : 1.5 + Math.random(),
          life: type === "rain" ? 60 : 120,
          size: type === "rain" ? 1 : type === "leaf" ? 3 : 2,
          type,
        });
      }
    }

    // Update weather particles
    s.weatherParticles = s.weatherParticles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.type === "leaf") {
        p.vx += Math.sin(p.life * 0.1) * 0.1;
      }
      if (p.type === "snow") {
        p.vx += Math.sin(p.life * 0.05) * 0.05;
      }
      p.life--;
      return p.life > 0 && p.y < canvasHW;
    });

    // Shooting stars — biome 4 only
    if (progress >= 0.75 && Math.random() < 0.02) {
      const life = 30 + Math.random() * 20;
      s.shootingStars.push({
        x: Math.random() * canvasWW,
        y: Math.random() * canvasHW * 0.4,
        vx: -(4 + Math.random() * 6),
        vy: 3 + Math.random() * 4,
        life,
        maxLife: life,
        length: 20 + Math.random() * 30,
      });
    }
    s.shootingStars = s.shootingStars.filter((star) => {
      star.x += star.vx;
      star.y += star.vy;
      star.life--;
      return star.life > 0;
    });

    // End detection
    if (s.scrollX >= WORLD_WIDTH) {
      s.finished = true;
    }
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
    if (s.wishActive) {
      renderer.drawWishScreen(ctx, w, h, s.wishTimer);
      return;
    }

    const isMoving = Math.abs(s.velocity) > 0.1;
    const frames = isMoving ? WALK_RIGHT_FRAMES : IDLE_FRAMES;

    // Screen shake offset
    ctx.save();
    if (s.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * s.screenShake * 2;
      const shakeY = (Math.random() - 0.5) * s.screenShake * 2;
      ctx.translate(shakeX, shakeY);
    }

    ctx.clearRect(0, 0, w + 20, h + 20); // slightly larger to cover shake

    // Draw layers
    renderer.drawSkyLayer(ctx, w, h, s.scrollX, biomes);
    renderer.drawDayNightTint(ctx, w, h, s.scrollX);
    renderer.drawDecorations(ctx, w, h, s.scrollX, DECORATIONS, "sky", s.collectedSet);

    // Shooting stars (biome 4)
    if (s.shootingStars.length > 0) {
      renderer.drawShootingStars(ctx, s.shootingStars);
    }

    renderer.drawMountainLayer(ctx, w, h, s.scrollX, biomes);
    renderer.drawDecorations(ctx, w, h, s.scrollX, DECORATIONS, "mountains", s.collectedSet);
    renderer.drawParallaxFog(ctx, w, h, s.scrollX, biomes, "far");
    renderer.drawMidgroundLayer(ctx, w, h, s.scrollX, biomes);
    renderer.drawDecorations(ctx, w, h, s.scrollX, DECORATIONS, "midground", s.collectedSet);
    renderer.drawParallaxFog(ctx, w, h, s.scrollX, biomes, "mid");
    renderer.drawFloatingText(ctx, w, h, s.scrollX, biomes, WORLD_WIDTH);
    renderer.drawParallaxFog(ctx, w, h, s.scrollX, biomes, "near");
    renderer.drawGroundLayer(ctx, w, h, s.scrollX, biomes);
    renderer.drawGroundSurface(ctx, w, h, s.scrollX);
    renderer.drawDecorations(ctx, w, h, s.scrollX, DECORATIONS, "ground", s.collectedSet);

    // Enemies
    renderer.drawEnemies(ctx, w, h, s.scrollX, s.enemies, ENEMIES);

    const playerScale = 3;
    const spriteHeight = 32 * playerScale;
    const playerX = w / 2 - (32 * playerScale) / 2;
    const playerY = h * PLAYER_Y_OFFSET - spriteHeight + s.jumpY;
    const crouchSquish = s.isCrouching ? 0.6 : 1;

    // Sprint afterimages
    if (s.afterimages.length > 0) {
      renderer.drawAfterimages(ctx, w, h, s.scrollX, s.afterimages, frames, playerScale);
    }

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
      s.isSuperSaiyan,
      s.isFlying,
      s.transformTimer,
    );

    // Kamehameha beam
    if (s.blastActive) {
      renderer.drawKamehameha(
        ctx, w, h, playerX, playerY, playerScale, s.facingLeft,
        s.blastTimer, BLAST_DURATION, s.isSuperSaiyan,
      );
    }

    // Dust particles
    if (s.dustParticles.length > 0) {
      renderer.drawDustParticles(ctx, s.dustParticles);
    }

    renderer.drawForegroundLayer(ctx, w, h, s.scrollX);

    // Weather
    if (s.weatherParticles.length > 0) {
      renderer.drawWeatherParticles(ctx, s.weatherParticles);
    }

    renderer.drawDecorations(ctx, w, h, s.scrollX, DECORATIONS, "foreground", s.collectedSet);

    // HUD
    renderer.drawScouter(ctx, w, s.powerLevel, s.collectedDragonBalls.size, s.enemiesKilled);

    // Dragon Ball radar
    renderer.drawDragonBallRadar(ctx, w, h, s.scrollX, s.collectedSet, DECORATIONS);

    // Controls hint
    renderer.drawControlsHint(ctx, w, h);

    // Milestone text
    if (s.milestoneTimer > 0 && s.milestoneText) {
      renderer.drawMilestoneText(ctx, w, h, s.milestoneText, s.milestoneTimer);
    }

    // Pickup text
    if (s.pickupTextTimer > 0 && s.pickupText) {
      renderer.drawPickupText(ctx, w, h, s.pickupText, s.pickupTextTimer);
    }

    // Teleport flash
    if (s.teleportFlash > 0) {
      renderer.drawTeleportFlash(ctx, w, h, s.teleportFlash);
    }

    // Transform flash
    if (s.transformFlash > 0) {
      renderer.drawTransformFlash(ctx, w, h, s.transformFlash);
    }

    // Power-up flash
    if (s.powerUpFlash > 0) {
      renderer.drawPowerUpFlash(ctx, w, h, s.powerUpFlash);
    }
    if (s.pickupFlash > 0) {
      renderer.drawPickupFlash(ctx, w, h, s.pickupFlash);
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

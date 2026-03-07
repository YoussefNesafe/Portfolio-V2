/**
 * Canvas renderer for the Dragon Ball-themed 2D side-scrolling story.
 *
 * Pure functions module -- no React. Every function receives a
 * CanvasRenderingContext2D and draws directly onto it.
 */

import {
  SENZU_SPRITE,
  DRAGON_BALL_SPRITE,
  NIMBUS_SPRITE,
} from "./sprite-data";
import { WORLD_WIDTH, PARALLAX_SPEEDS, PLAYER_Y_OFFSET } from "./world-data";
import type { Decoration } from "./world-data";
import type { IStoryBiome } from "@/app/models/IStoryDictionary";

/** Vertical position of the ground surface as a fraction of canvas height. */
const GROUND_Y_RATIO = PLAYER_Y_OFFSET;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a hex color string (#RRGGBB) into [r, g, b]. */
function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

/** Convert [r, g, b] back to a hex string. */
function toHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    "#" +
    clamp(r).toString(16).padStart(2, "0") +
    clamp(g).toString(16).padStart(2, "0") +
    clamp(b).toString(16).padStart(2, "0")
  );
}

/** Linearly interpolate between two hex colors. t in [0,1]. */
function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  return toHex(
    ar + (br - ar) * t,
    ag + (bg - ag) * t,
    ab + (bb - ab) * t,
  );
}

/** Return the index of the biome the player is currently in. */
function getBiomeAtProgress(
  biomes: IStoryBiome[],
  progress: number,
): number {
  for (let i = biomes.length - 1; i >= 0; i--) {
    if (progress >= biomes[i].startX) return i;
  }
  return 0;
}

/**
 * Get the current biome colors with interpolation toward the next biome
 * near biome boundaries.
 */
function interpolateBiomeColors(
  biomes: IStoryBiome[],
  progress: number,
): {
  skyTop: string;
  skyBottom: string;
  groundColor: string;
  mountainColor: string;
} {
  const idx = getBiomeAtProgress(biomes, progress);
  const biome = biomes[idx];

  if (idx >= biomes.length - 1) {
    return {
      skyTop: biome.skyGradient[0],
      skyBottom: biome.skyGradient[1],
      groundColor: biome.groundColor,
      mountainColor: biome.mountainColor,
    };
  }

  const next = biomes[idx + 1];
  const biomeStart = biome.startX;
  const biomeEnd = next.startX;
  const biomeLen = biomeEnd - biomeStart;

  // Start blending in the last 20% of the biome
  const blendStart = biomeEnd - biomeLen * 0.2;
  if (progress < blendStart) {
    return {
      skyTop: biome.skyGradient[0],
      skyBottom: biome.skyGradient[1],
      groundColor: biome.groundColor,
      mountainColor: biome.mountainColor,
    };
  }

  const t = (progress - blendStart) / (biomeEnd - blendStart);
  return {
    skyTop: lerpColor(biome.skyGradient[0], next.skyGradient[0], t),
    skyBottom: lerpColor(biome.skyGradient[1], next.skyGradient[1], t),
    groundColor: lerpColor(biome.groundColor, next.groundColor, t),
    mountainColor: lerpColor(biome.mountainColor, next.mountainColor, t),
  };
}

// ---------------------------------------------------------------------------
// Seeded pseudo-random for deterministic positioning
// ---------------------------------------------------------------------------

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ---------------------------------------------------------------------------
// 1. Sky layer
// ---------------------------------------------------------------------------

export function drawSkyLayer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollX: number,
  biomes: IStoryBiome[],
): void {
  const progress = scrollX / WORLD_WIDTH;
  const { skyTop, skyBottom } = interpolateBiomeColors(biomes, progress);

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, skyTop);
  grad.addColorStop(1, skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Simple pixel-art clouds that drift slowly
  const cloudOffset = scrollX * PARALLAX_SPEEDS.sky * 0.5;
  const cloudCount = 8;
  for (let i = 0; i < cloudCount; i++) {
    const baseX = seededRandom(i * 3 + 1) * w * 2;
    const baseY = seededRandom(i * 3 + 2) * h * 0.35 + h * 0.05;
    const cloudW = 30 + seededRandom(i * 3 + 3) * 40;

    const cx = ((baseX - cloudOffset) % (w * 2 + cloudW)) - cloudW;
    if (cx < -cloudW || cx > w + cloudW) continue;

    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    // Cloud body: a few overlapping rectangles
    ctx.fillRect(cx, baseY, cloudW, 4);
    ctx.fillRect(cx + cloudW * 0.15, baseY - 4, cloudW * 0.7, 4);
    ctx.fillRect(cx + cloudW * 0.3, baseY - 8, cloudW * 0.4, 4);
    ctx.fillRect(cx + cloudW * 0.1, baseY + 4, cloudW * 0.5, 4);
  }
}

// ---------------------------------------------------------------------------
// 2. Mountain layer
// ---------------------------------------------------------------------------

export function drawMountainLayer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollX: number,
  biomes: IStoryBiome[],
): void {
  const progress = scrollX / WORLD_WIDTH;
  const { mountainColor } = interpolateBiomeColors(biomes, progress);
  const offset = scrollX * PARALLAX_SPEEDS.mountains;

  const baseY = h * 0.6; // mountains sit in bottom 40%
  const mountainCount = 20;
  const tileWidth = w * 2; // repeat tile

  ctx.fillStyle = mountainColor;
  ctx.beginPath();
  ctx.moveTo(0, h);

  for (let i = 0; i < mountainCount; i++) {
    const peakX =
      ((seededRandom(i * 2 + 10) * tileWidth - offset) % tileWidth + tileWidth) %
        tileWidth -
      tileWidth * 0.1;
    const peakY = baseY - seededRandom(i * 2 + 11) * h * 0.3 - h * 0.05;
    const halfW = 60 + seededRandom(i * 2 + 12) * 100;

    ctx.lineTo(peakX - halfW, baseY);
    ctx.lineTo(peakX, peakY);
    ctx.lineTo(peakX + halfW, baseY);
  }

  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // Fill the area below the mountain line to avoid gaps
  ctx.fillRect(0, baseY, w, h - baseY);
}

// ---------------------------------------------------------------------------
// 3. Midground layer
// ---------------------------------------------------------------------------

export function drawMidgroundLayer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollX: number,
  biomes: IStoryBiome[],
): void {
  const progress = scrollX / WORLD_WIDTH;
  const { mountainColor } = interpolateBiomeColors(biomes, progress);
  const offset = scrollX * PARALLAX_SPEEDS.midground;

  // Slightly lighter version of mountain color for midground
  const [mr, mg, mb] = parseHex(mountainColor);
  const lighterColor = toHex(
    Math.min(255, mr + 25),
    Math.min(255, mg + 25),
    Math.min(255, mb + 25),
  );

  const baseY = h * 0.68;
  const hillCount = 15;
  const tileWidth = w * 2.5;

  ctx.fillStyle = lighterColor;

  for (let i = 0; i < hillCount; i++) {
    const cx =
      ((seededRandom(i * 2 + 50) * tileWidth - offset) % tileWidth +
        tileWidth) %
        tileWidth -
      tileWidth * 0.1;
    const hillW = 80 + seededRandom(i * 2 + 51) * 120;
    const hillH = 20 + seededRandom(i * 2 + 52) * 40;

    ctx.beginPath();
    ctx.moveTo(cx - hillW / 2, baseY);
    ctx.quadraticCurveTo(cx, baseY - hillH, cx + hillW / 2, baseY);
    ctx.fill();
  }

  // Fill below midground line
  ctx.fillRect(0, baseY, w, h - baseY);
}

// ---------------------------------------------------------------------------
// 4. Ground layer
// ---------------------------------------------------------------------------

export function drawGroundLayer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollX: number,
  biomes: IStoryBiome[],
): void {
  const progress = scrollX / WORLD_WIDTH;
  const { groundColor } = interpolateBiomeColors(biomes, progress);

  const groundY = h * GROUND_Y_RATIO;

  // Ground fill
  ctx.fillStyle = groundColor;
  ctx.fillRect(0, groundY, w, h - groundY);

  // Bright surface line at top of ground
  const [gr, gg, gb] = parseHex(groundColor);
  const surfaceColor = toHex(
    Math.min(255, gr + 40),
    Math.min(255, gg + 40),
    Math.min(255, gb + 40),
  );
  ctx.fillStyle = surfaceColor;
  ctx.fillRect(0, groundY, w, 2);
}

// ---------------------------------------------------------------------------
// 5. Foreground layer
// ---------------------------------------------------------------------------

export function drawForegroundLayer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollX: number,
): void {
  const offset = scrollX * PARALLAX_SPEEDS.foreground;
  const groundY = h * GROUND_Y_RATIO;
  const now = Date.now();

  // Grass tufts at ground level
  const grassCount = 40;
  const tileWidth = w * 1.5;

  ctx.strokeStyle = "rgba(34, 197, 94, 0.4)"; // green
  ctx.lineWidth = 1;

  for (let i = 0; i < grassCount; i++) {
    const gx =
      ((seededRandom(i + 100) * tileWidth - offset) % tileWidth + tileWidth) %
        tileWidth -
      50;
    if (gx < -10 || gx > w + 10) continue;

    const bladeCount = 2 + Math.floor(seededRandom(i + 200) * 2);
    for (let b = 0; b < bladeCount; b++) {
      ctx.beginPath();
      ctx.moveTo(gx + b * 3, groundY);
      ctx.lineTo(
        gx + b * 3 + (seededRandom(i * 10 + b) - 0.5) * 4,
        groundY - 3 - seededRandom(i * 10 + b + 1) * 4,
      );
      ctx.stroke();
    }
  }

  // Ki energy particles: small glowing dots floating upward
  const particleCount = 12;
  for (let i = 0; i < particleCount; i++) {
    const baseX = seededRandom(i + 300) * w;
    const cycleSpeed = 2000 + seededRandom(i + 301) * 3000;
    const phase = ((now + seededRandom(i + 302) * 5000) % cycleSpeed) / cycleSpeed;

    const px = baseX + Math.sin(phase * Math.PI * 2) * 10 - (offset % w);
    const py = groundY - phase * h * 0.3;
    const alpha = (1 - phase) * 0.4;

    if (px < -10 || px > w + 10) continue;

    const isCyan = i % 2 === 0;
    ctx.fillStyle = isCyan
      ? `rgba(6, 182, 212, ${alpha})`
      : `rgba(168, 85, 247, ${alpha})`;

    ctx.beginPath();
    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// 6. Floating text
// ---------------------------------------------------------------------------

export function drawFloatingText(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollX: number,
  biomes: IStoryBiome[],
  worldWidth: number,
): void {
  const textParallax = 0.45; // scrolls between mountains and midground
  const textOffset = scrollX * textParallax;

  for (const biome of biomes) {
    for (const item of biome.texts) {
      const worldX = item.x * worldWidth;
      const screenX = worldX - textOffset;

      // Skip if off screen
      if (screenX < -w * 0.5 || screenX > w * 1.5) continue;

      // Fade based on distance from screen center
      const distFromCenter = Math.abs(screenX - w / 2);
      const fadeStart = w * 0.25;
      const fadeEnd = w * 0.55;
      let alpha: number;
      if (distFromCenter <= fadeStart) {
        alpha = 1;
      } else if (distFromCenter <= fadeEnd) {
        alpha = 1 - (distFromCenter - fadeStart) / (fadeEnd - fadeStart);
      } else {
        alpha = 0;
      }
      if (alpha <= 0) continue;

      const isTitle = item.size === "large";
      const isDesc = item.size === "desc";

      let fontSize: number;
      let fontWeight: string;
      let textY: number;

      if (isTitle) {
        fontSize = Math.max(Math.round(w * 0.032), 30);
        fontWeight = "bold ";
        textY = h * 0.18;
      } else if (isDesc) {
        fontSize = Math.max(Math.round(w * 0.01), 12);
        fontWeight = "";
        textY = h * 0.24;
      } else {
        fontSize = Math.max(Math.round(w * 0.013), 15);
        fontWeight = "";
        textY = h * 0.32;
      }

      ctx.save();

      // Shadow for readability
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(0, 0, 0, 0.95)";

      if (item.glow) {
        ctx.shadowBlur = 25;
        ctx.shadowColor = "#FFD700";
      }

      ctx.font = `${fontWeight}${fontSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Dark outline for non-glow text
      if (!item.glow) {
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.8})`;
        ctx.fillText(item.text, screenX + 2, textY + 2);
      }

      // Main text color
      if (isTitle) {
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`; // gold for titles
      } else if (isDesc) {
        ctx.fillStyle = `rgba(180, 180, 200, ${alpha * 0.8})`; // muted for descriptions
      } else if (item.glow) {
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      }

      ctx.fillText(item.text, screenX, textY);
      ctx.restore();
    }
  }
}

// ---------------------------------------------------------------------------
// 7. Draw sprite
// ---------------------------------------------------------------------------

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: string[][],
  x: number,
  y: number,
  scale: number,
): void {
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const color = sprite[row][col];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
}

// ---------------------------------------------------------------------------
// 8. Draw player
// ---------------------------------------------------------------------------

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  frames: string[][][],
  frameIndex: number,
  x: number,
  y: number,
  scale: number,
  facingLeft: boolean,
  isSprinting: boolean = false,
  crouchSquish: number = 1,
): void {
  const frame = frames[frameIndex % frames.length];
  const spriteW = frame[0].length * scale;
  const spriteH = frame.length * scale;
  const centerX = x + spriteW / 2;
  const centerY = y + spriteH / 2;

  // Sprint power glow — large glowing aura around character
  if (isSprinting) {
    const now = Date.now();
    const pulse = 0.4 + Math.sin(now / 100) * 0.15;

    // Outer glow
    const grad = ctx.createRadialGradient(centerX, centerY, spriteW * 0.3, centerX, centerY, spriteW * 1.2);
    grad.addColorStop(0, `rgba(255, 215, 0, ${pulse * 0.5})`);
    grad.addColorStop(0.4, `rgba(255, 107, 0, ${pulse * 0.3})`);
    grad.addColorStop(1, "rgba(255, 107, 0, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, spriteW * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Inner ki flames — upward streaks
    for (let i = 0; i < 12; i++) {
      const flameX = centerX + (Math.sin(now / 80 + i * 1.7) * spriteW * 0.4);
      const flameY = centerY - (((now / 40 + i * 50) % (spriteH * 1.2)));
      const flameAlpha = 0.5 - (((now / 40 + i * 50) % (spriteH * 1.2)) / (spriteH * 1.2)) * 0.5;
      if (flameAlpha <= 0) continue;
      ctx.fillStyle = i % 2 === 0
        ? `rgba(255, 215, 0, ${flameAlpha})`
        : `rgba(255, 107, 0, ${flameAlpha})`;
      ctx.beginPath();
      ctx.arc(flameX, flameY, 2 + Math.sin(now / 60 + i) * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Normal aura particles
  const auraColors = isSprinting ? ["#FFD700", "#FF6B00"] : ["#06B6D4", "#A855F7"];
  const auraCount = isSprinting ? 14 : 7;
  const auraScale = isSprinting ? 1.5 : 1;

  for (let i = 0; i < auraCount; i++) {
    const angle =
      (i / auraCount) * Math.PI * 2 +
      Math.sin(frameIndex * 0.3 + i) * 0.4;
    const dist = (spriteW * 0.5 + Math.sin(frameIndex * 0.5 + i * 1.3) * 6) * auraScale;
    const px = centerX + Math.cos(angle) * dist;
    const py = centerY + Math.sin(angle) * dist;
    const alpha = (0.3 + Math.sin(frameIndex * 0.4 + i * 0.7) * 0.1) * (isSprinting ? 1.5 : 1);
    const size = (3 + Math.sin(frameIndex * 0.6 + i * 1.1) * 1.5) * auraScale;

    const color = auraColors[i % 2];
    const [r, g, b] = parseHex(color);

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(1, alpha)})`;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw the sprite with optional crouch squish
  ctx.save();
  if (crouchSquish < 1) {
    const squishY = y + spriteH * (1 - crouchSquish);
    ctx.translate(0, squishY - y);
    ctx.scale(1, crouchSquish);
    ctx.translate(0, y * (1 / crouchSquish - 1));
  }

  if (facingLeft) {
    ctx.save();
    ctx.translate(x + spriteW, 0);
    ctx.scale(-1, 1);
    drawSprite(ctx, frame, 0, y, scale);
    ctx.restore();
  } else {
    drawSprite(ctx, frame, x, y, scale);
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 9. Draw scouter HUD
// ---------------------------------------------------------------------------

export function drawScouter(
  ctx: CanvasRenderingContext2D,
  w: number,
  powerLevel: number,
  dragonBallCount: number = 0,
): void {
  const boxW = Math.round(w * 0.12);
  const boxH = Math.round(w * 0.06);
  const boxX = w - boxW - Math.round(w * 0.015);
  const boxY = Math.round(w * 0.015);
  const radius = 6;

  // Background with stronger opacity
  ctx.fillStyle = "rgba(10, 42, 10, 0.9)";
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(boxX + radius, boxY);
  ctx.lineTo(boxX + boxW - radius, boxY);
  ctx.arcTo(boxX + boxW, boxY, boxX + boxW, boxY + radius, radius);
  ctx.lineTo(boxX + boxW, boxY + boxH - radius);
  ctx.arcTo(boxX + boxW, boxY + boxH, boxX + boxW - radius, boxY + boxH, radius);
  ctx.lineTo(boxX + radius, boxY + boxH);
  ctx.arcTo(boxX, boxY + boxH, boxX, boxY + boxH - radius, radius);
  ctx.lineTo(boxX, boxY + radius);
  ctx.arcTo(boxX, boxY, boxX + radius, boxY, radius);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // "PWR" label
  const labelSize = Math.max(Math.round(w * 0.008), 10);
  const numSize = Math.max(Math.round(w * 0.014), 16);
  const pad = Math.round(boxW * 0.1);
  ctx.font = `${labelSize}px monospace`;
  ctx.fillStyle = "#4ade80";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("POWER LEVEL", boxX + pad, boxY + pad);

  // Power level number
  const isOver9000 = powerLevel >= 9001;
  if (isOver9000) {
    const flash = Date.now() % 1000 < 500;
    ctx.fillStyle = flash ? "#22c55e" : "#FFD700";
  } else {
    ctx.fillStyle = "#22c55e";
  }
  ctx.font = `bold ${numSize}px monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText(String(powerLevel), boxX + pad, boxY + boxH - pad);

  // Dragon Ball counter — right side of scouter
  if (dragonBallCount > 0) {
    ctx.font = `${labelSize}px monospace`;
    ctx.fillStyle = "#FFD700";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(`★ ${dragonBallCount}/7`, boxX + boxW - pad, boxY + boxH - pad);
  }
}

// ---------------------------------------------------------------------------
// 10. Draw decorations
// ---------------------------------------------------------------------------

export function drawDecorations(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollX: number,
  decorations: Decoration[],
  targetLayer: keyof typeof PARALLAX_SPEEDS,
  collectedSet: Set<number> = new Set(),
): void {
  const speed = PARALLAX_SPEEDS[targetLayer];
  const margin = 100;

  for (let i = 0; i < decorations.length; i++) {
    const dec = decorations[i];
    if (dec.layer !== targetLayer) continue;
    if (collectedSet.has(i)) continue; // skip collected items

    const screenX = dec.x - scrollX * speed;
    if (screenX < -margin || screenX > w + margin) continue;

    const screenY = dec.y * h;

    switch (dec.type) {
      case "senzu":
        drawSprite(ctx, SENZU_SPRITE, screenX, screenY, 3);
        // Glow effect around senzu
        ctx.fillStyle = "rgba(34, 197, 94, 0.15)";
        ctx.beginPath();
        ctx.arc(screenX + 12, screenY + 12, 18, 0, Math.PI * 2);
        ctx.fill();
        break;

      case "dragonball":
        drawSprite(ctx, DRAGON_BALL_SPRITE, screenX, screenY, 3);
        // Pulsing glow around dragon ball
        {
          const pulse = 0.15 + Math.sin(Date.now() / 400) * 0.1;
          ctx.fillStyle = `rgba(255, 140, 0, ${pulse})`;
          ctx.beginPath();
          ctx.arc(screenX + 18, screenY + 18, 24, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case "ki_orb":
        drawKiOrb(ctx, screenX, screenY);
        break;

      case "nimbus":
        drawSprite(ctx, NIMBUS_SPRITE, screenX, screenY, 3);
        break;

      case "tree":
        drawTree(ctx, screenX, screenY, h);
        break;

      case "rock":
        drawRock(ctx, screenX, screenY);
        break;

      case "waterfall":
        drawWaterfall(ctx, screenX, screenY, h);
        break;

      case "building":
        drawBuilding(ctx, screenX, screenY, h);
        break;

      case "banner":
        drawBanner(ctx, screenX, screenY, h);
        break;

      case "star":
        drawStar(ctx, screenX, screenY);
        break;
    }
  }
}

// -- Decoration shape helpers -----------------------------------------------

function drawTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
): void {
  const groundY = h * GROUND_Y_RATIO;
  const trunkW = 8;
  const trunkH = groundY - y - 20;

  // Trunk
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(x - trunkW / 2, y + 20, trunkW, trunkH);

  // Canopy (triangle)
  ctx.fillStyle = "#228B22";
  ctx.beginPath();
  ctx.moveTo(x, y - 10);
  ctx.lineTo(x - 25, y + 25);
  ctx.lineTo(x + 25, y + 25);
  ctx.closePath();
  ctx.fill();

  // Second smaller triangle
  ctx.beginPath();
  ctx.moveTo(x, y - 25);
  ctx.lineTo(x - 18, y);
  ctx.lineTo(x + 18, y);
  ctx.closePath();
  ctx.fill();
}

function drawRock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): void {
  ctx.fillStyle = "#6B7280";
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 10);
  ctx.lineTo(x - 8, y - 5);
  ctx.lineTo(x + 2, y - 10);
  ctx.lineTo(x + 14, y - 3);
  ctx.lineTo(x + 16, y + 10);
  ctx.closePath();
  ctx.fill();

  // Highlight
  ctx.fillStyle = "#9CA3AF";
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 2);
  ctx.lineTo(x + 2, y - 8);
  ctx.lineTo(x + 8, y - 4);
  ctx.lineTo(x + 2, y + 2);
  ctx.closePath();
  ctx.fill();
}

function drawWaterfall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
): void {
  const groundY = h * GROUND_Y_RATIO;
  const waterfallH = groundY - y;
  const waterfallW = 20;
  const now = Date.now();

  // Blue water body
  ctx.fillStyle = "rgba(59, 130, 246, 0.6)";
  ctx.fillRect(x - waterfallW / 2, y, waterfallW, waterfallH);

  // Animated white streaks
  const streakCount = 4;
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  for (let i = 0; i < streakCount; i++) {
    const streakX = x - waterfallW / 2 + 3 + i * 5;
    const streakOffset = ((now / 200 + i * 30) % waterfallH);
    ctx.fillRect(streakX, y + streakOffset, 2, 12);
    // Wrap around
    if (y + streakOffset + 12 > y + waterfallH) {
      ctx.fillRect(streakX, y, 2, 12 - (y + waterfallH - y - streakOffset));
    }
  }

  // Mist at bottom
  ctx.fillStyle = "rgba(200, 220, 255, 0.15)";
  ctx.beginPath();
  ctx.arc(x, groundY, 20, 0, Math.PI * 2);
  ctx.fill();
}

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
): void {
  const groundY = h * GROUND_Y_RATIO;
  const buildingW = 50;
  const buildingH = groundY - y;

  // Main body
  ctx.fillStyle = "#E5E7EB";
  ctx.fillRect(x - buildingW / 2, y, buildingW, buildingH);

  // Dome top (Capsule Corp style)
  ctx.fillStyle = "#60A5FA";
  ctx.beginPath();
  ctx.arc(x, y, buildingW / 2, Math.PI, 0);
  ctx.fill();

  // Windows
  ctx.fillStyle = "#FDE68A";
  const windowSize = 8;
  const windowGap = 14;
  const cols = 3;
  const rows = Math.floor((buildingH - 10) / windowGap);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillRect(
        x - (cols * windowGap) / 2 + c * windowGap + 3,
        y + 10 + r * windowGap,
        windowSize,
        windowSize,
      );
    }
  }

  // Outline
  ctx.strokeStyle = "#9CA3AF";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - buildingW / 2, y, buildingW, buildingH);
}

function drawBanner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
): void {
  const groundY = h * GROUND_Y_RATIO;
  const poleH = groundY - y;

  // Pole
  ctx.fillStyle = "#9CA3AF";
  ctx.fillRect(x - 1, y, 3, poleH);

  // Flag (triangle)
  ctx.fillStyle = "#EF4444";
  ctx.beginPath();
  ctx.moveTo(x + 2, y);
  ctx.lineTo(x + 30, y + 10);
  ctx.lineTo(x + 2, y + 20);
  ctx.closePath();
  ctx.fill();

  // Flag accent stripe
  ctx.fillStyle = "#FFD700";
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 8);
  ctx.lineTo(x + 20, y + 12);
  ctx.lineTo(x + 2, y + 14);
  ctx.closePath();
  ctx.fill();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): void {
  const now = Date.now();
  const pulse = 0.5 + Math.sin(now / 500) * 0.3;

  // Central dot
  ctx.fillStyle = `rgba(255, 255, 255, ${pulse + 0.3})`;
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fill();

  // 4-point sparkle
  ctx.strokeStyle = `rgba(255, 255, 255, ${pulse * 0.6})`;
  ctx.lineWidth = 1;
  const armLen = 5 + Math.sin(now / 700) * 2;

  ctx.beginPath();
  ctx.moveTo(x - armLen, y);
  ctx.lineTo(x + armLen, y);
  ctx.moveTo(x, y - armLen);
  ctx.lineTo(x, y + armLen);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// 11. Ki orb decoration
// ---------------------------------------------------------------------------

function drawKiOrb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): void {
  const now = Date.now();
  const pulse = 0.6 + Math.sin(now / 300) * 0.3;
  const bobY = y + Math.sin(now / 500) * 3;

  // Outer glow
  const grad = ctx.createRadialGradient(x, bobY, 1, x, bobY, 12);
  grad.addColorStop(0, `rgba(6, 182, 212, ${pulse * 0.6})`);
  grad.addColorStop(0.5, `rgba(168, 85, 247, ${pulse * 0.3})`);
  grad.addColorStop(1, "rgba(168, 85, 247, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, bobY, 12, 0, Math.PI * 2);
  ctx.fill();

  // Core
  ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
  ctx.beginPath();
  ctx.arc(x, bobY, 3, 0, Math.PI * 2);
  ctx.fill();
}

// ---------------------------------------------------------------------------
// 12. Pickup text notification
// ---------------------------------------------------------------------------

export function drawPickupText(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  text: string,
  timer: number,
): void {
  if (!text || timer <= 0) return;

  const alpha = Math.min(1, timer / 30); // fade out in last 30 frames
  const fontSize = Math.max(Math.round(w * 0.012), 14);
  const yOffset = h * 0.65 - (1 - Math.min(1, timer / 60)) * 20; // float upward

  ctx.save();
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Shadow
  ctx.shadowBlur = 8;
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";

  // Outline
  ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.6})`;
  ctx.fillText(text, w / 2 + 1, yOffset + 1);

  // Main text (gold)
  ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
  ctx.fillText(text, w / 2, yOffset);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 13. Pickup flash (golden)
// ---------------------------------------------------------------------------

export function drawPickupFlash(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number,
): void {
  if (intensity <= 0) return;
  ctx.fillStyle = `rgba(255, 215, 0, ${Math.min(0.4, intensity * 0.5)})`;
  ctx.fillRect(0, 0, w, h);
}

// ---------------------------------------------------------------------------
// 14. Power-up flash (white)
// ---------------------------------------------------------------------------

export function drawPowerUpFlash(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number,
): void {
  if (intensity <= 0) return;
  ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, intensity)})`;
  ctx.fillRect(0, 0, w, h);
}

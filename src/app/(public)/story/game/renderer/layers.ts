/**
 * Parallax background layers for the renderer.
 */

import { WORLD_WIDTH, PARALLAX_SPEEDS } from "../world-data";
import type { IStoryBiome } from "@/app/models/IStoryDictionary";
import {
  GROUND_Y_RATIO,
  parseHex,
  toHex,
  interpolateBiomeColors,
  seededRandom,
} from "./helpers";

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
// Day/Night cycle tint
// ---------------------------------------------------------------------------

export function drawDayNightTint(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollX: number,
): void {
  const progress = scrollX / WORLD_WIDTH;

  // Tint stages: dawn (warm), midday (clear), sunset (orange), night (dark blue)
  let tintColor: string;
  let tintAlpha: number;

  if (progress < 0.2) {
    // Dawn — warm orange tint fading out
    tintColor = "255, 180, 100";
    tintAlpha = 0.08 * (1 - progress / 0.2);
  } else if (progress < 0.45) {
    // Midday — no tint
    tintColor = "0, 0, 0";
    tintAlpha = 0;
  } else if (progress < 0.65) {
    // Sunset — orange/red tint fading in
    const t = (progress - 0.45) / 0.2;
    tintColor = "255, 100, 50";
    tintAlpha = t * 0.12;
  } else if (progress < 0.8) {
    // Transition to night
    const t = (progress - 0.65) / 0.15;
    tintColor = `${Math.round(255 - t * 235)}, ${Math.round(100 - t * 80)}, ${Math.round(50 + t * 100)}`;
    tintAlpha = 0.12 + t * 0.08;
  } else {
    // Night — dark blue tint
    tintColor = "20, 20, 150";
    tintAlpha = 0.2;
  }

  if (tintAlpha > 0) {
    ctx.fillStyle = `rgba(${tintColor}, ${tintAlpha})`;
    ctx.fillRect(0, 0, w, h);
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
// Animated ground surface effects
// ---------------------------------------------------------------------------

export function drawGroundSurface(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollX: number,
): void {
  const progress = scrollX / WORLD_WIDTH;
  const groundY = h * GROUND_Y_RATIO;
  const now = Date.now();

  if (progress < 0.25) {
    // Biome 1: Water ripples — animated sine waves at ground surface
    ctx.strokeStyle = "rgba(100, 180, 255, 0.15)";
    ctx.lineWidth = 1;
    for (let row = 0; row < 3; row++) {
      ctx.beginPath();
      const yOff = groundY + 4 + row * 6;
      for (let x = 0; x < w; x += 4) {
        const waveY = yOff + Math.sin((x + scrollX * 0.5 + now * 0.002 + row * 2) * 0.05) * 2;
        if (x === 0) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
      }
      ctx.stroke();
    }
  } else if (progress < 0.5) {
    // Biome 2: Tech grid scan lines
    ctx.strokeStyle = "rgba(6, 182, 212, 0.08)";
    ctx.lineWidth = 1;
    const gridSpacing = 12;
    const offset = (scrollX * 0.3 + now * 0.01) % gridSpacing;
    for (let x = -offset; x < w; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x, groundY + 20);
      ctx.stroke();
    }
    // Horizontal scan line
    const scanY = groundY + ((now * 0.02) % 20);
    ctx.strokeStyle = "rgba(6, 182, 212, 0.12)";
    ctx.beginPath();
    ctx.moveTo(0, scanY);
    ctx.lineTo(w, scanY);
    ctx.stroke();
  } else if (progress < 0.75) {
    // Biome 3: Lava/energy glow
    ctx.strokeStyle = "rgba(255, 100, 30, 0.12)";
    ctx.lineWidth = 2;
    for (let row = 0; row < 2; row++) {
      ctx.beginPath();
      const yOff = groundY + 2 + row * 5;
      for (let x = 0; x < w; x += 4) {
        const waveY = yOff + Math.sin((x - scrollX * 0.4 + now * 0.003 + row * 3) * 0.08) * 1.5;
        if (x === 0) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
      }
      ctx.stroke();
    }
    // Occasional glow pulse
    const pulseAlpha = Math.sin(now * 0.003) * 0.05 + 0.05;
    ctx.fillStyle = `rgba(255, 80, 20, ${pulseAlpha})`;
    ctx.fillRect(0, groundY, w, 15);
  }
  // Biome 4 (space): no ground surface effect
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
// Parallax fog layers
// ---------------------------------------------------------------------------

export function drawParallaxFog(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollX: number,
  biomes: IStoryBiome[],
  layer: "far" | "mid" | "near",
): void {
  const progress = scrollX / WORLD_WIDTH;
  const { groundColor } = interpolateBiomeColors(biomes, progress);
  const [r, g, b] = parseHex(groundColor);

  let alpha: number;
  let yStart: number;
  let yEnd: number;

  switch (layer) {
    case "far":
      alpha = 0.06;
      yStart = h * 0.45;
      yEnd = h * 0.65;
      break;
    case "mid":
      alpha = 0.08;
      yStart = h * 0.55;
      yEnd = h * 0.72;
      break;
    case "near":
      alpha = 0.04;
      yStart = h * 0.65;
      yEnd = h * 0.78;
      break;
  }

  const grad = ctx.createLinearGradient(0, yStart, 0, yEnd);
  grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
  grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha})`);
  grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

  ctx.fillStyle = grad;
  ctx.fillRect(0, yStart, w, yEnd - yStart);
}

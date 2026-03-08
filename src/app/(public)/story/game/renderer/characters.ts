/**
 * Player and enemy rendering for the renderer.
 */

import { PARALLAX_SPEEDS, PLAYER_Y_OFFSET } from "../world-data";
import type { EnemyDef } from "../world-data";
import { GROUND_Y_RATIO, parseHex } from "./helpers";

// ---------------------------------------------------------------------------
// 7. Draw sprite
// ---------------------------------------------------------------------------

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: string[][],
  x: number,
  y: number,
  scale: number,
  colorRemap?: Record<string, string>,
): void {
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const color = sprite[row][col];
      if (!color) continue;
      ctx.fillStyle = colorRemap?.[color] ?? color;
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
  isSuperSaiyan: boolean = false,
  isFlying: boolean = false,
  transformTimer: number = 0,
): void {
  const frame = frames[frameIndex % frames.length];
  const spriteW = frame[0].length * scale;
  const spriteH = frame.length * scale;
  const centerX = x + spriteW / 2;
  const centerY = y + spriteH / 2;
  const now = Date.now();

  // Transformation animation — intense aura burst
  if (transformTimer > 0) {
    const t = transformTimer / 120;
    const burstRadius = spriteW * (3 - t * 2);
    const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, burstRadius);
    grad.addColorStop(0, `rgba(255, 215, 0, ${t * 0.8})`);
    grad.addColorStop(0.3, `rgba(255, 140, 0, ${t * 0.5})`);
    grad.addColorStop(0.6, `rgba(255, 69, 0, ${t * 0.3})`);
    grad.addColorStop(1, "rgba(255, 69, 0, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, burstRadius, 0, Math.PI * 2);
    ctx.fill();

    // Lightning bolts during transformation
    for (let i = 0; i < 6; i++) {
      const angle = (now / 50 + i * 1.05) % (Math.PI * 2);
      const dist = spriteW * (0.8 + Math.sin(now / 30 + i) * 0.4);
      const lx = centerX + Math.cos(angle) * dist;
      const ly = centerY + Math.sin(angle) * dist;
      ctx.strokeStyle = `rgba(255, 255, 100, ${t * 0.8})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX + Math.cos(angle) * spriteW * 0.3, centerY + Math.sin(angle) * spriteW * 0.3);
      const midX = (centerX + lx) / 2 + (Math.random() - 0.5) * 15;
      const midY = (centerY + ly) / 2 + (Math.random() - 0.5) * 15;
      ctx.lineTo(midX, midY);
      ctx.lineTo(lx, ly);
      ctx.stroke();
    }
  }

  // Sprint / SSJ power glow
  if (isSprinting || isSuperSaiyan) {
    const pulse = 0.4 + Math.sin(now / 100) * 0.15;
    const glowMult = isSuperSaiyan ? 1.5 : 1;

    // Outer glow
    const grad = ctx.createRadialGradient(
      centerX, centerY, spriteW * 0.3,
      centerX, centerY, spriteW * 1.2 * glowMult,
    );
    grad.addColorStop(0, `rgba(255, 215, 0, ${pulse * 0.5 * glowMult})`);
    grad.addColorStop(0.4, `rgba(255, 107, 0, ${pulse * 0.3 * glowMult})`);
    grad.addColorStop(1, "rgba(255, 107, 0, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, spriteW * 1.2 * glowMult, 0, Math.PI * 2);
    ctx.fill();

    // Ki flames
    const flameCount = isSuperSaiyan ? 18 : 12;
    for (let i = 0; i < flameCount; i++) {
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

  // Flying wind lines
  if (isFlying) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const lineY = centerY - spriteH * 0.3 + i * (spriteH * 0.1);
      const lineX = centerX + spriteW * 0.5;
      const lineLen = 15 + Math.sin(now / 100 + i) * 8;
      ctx.beginPath();
      ctx.moveTo(lineX, lineY);
      ctx.lineTo(lineX + lineLen, lineY + (Math.random() - 0.5) * 3);
      ctx.stroke();
    }
  }

  // Aura particles
  const isGold = isSprinting || isSuperSaiyan;
  const auraColors = isGold ? ["#FFD700", "#FF6B00"] : ["#06B6D4", "#A855F7"];
  const auraCount = isSuperSaiyan ? 18 : isSprinting ? 14 : 7;
  const auraSc = isSuperSaiyan ? 1.8 : isSprinting ? 1.5 : 1;

  for (let i = 0; i < auraCount; i++) {
    const angle =
      (i / auraCount) * Math.PI * 2 +
      Math.sin(frameIndex * 0.3 + i) * 0.4;
    const dist = (spriteW * 0.5 + Math.sin(frameIndex * 0.5 + i * 1.3) * 6) * auraSc;
    const px = centerX + Math.cos(angle) * dist;
    const py = centerY + Math.sin(angle) * dist;
    const alpha = (0.3 + Math.sin(frameIndex * 0.4 + i * 0.7) * 0.1) * (isGold ? 1.5 : 1);
    const size = (3 + Math.sin(frameIndex * 0.6 + i * 1.1) * 1.5) * auraSc;

    const color = auraColors[i % 2];
    const [r, g, b] = parseHex(color);

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(1, alpha)})`;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw the sprite with optional crouch squish & SSJ golden tint
  ctx.save();
  if (crouchSquish < 1) {
    const squishY = y + spriteH * (1 - crouchSquish);
    ctx.translate(0, squishY - y);
    ctx.scale(1, crouchSquish);
    ctx.translate(0, y * (1 / crouchSquish - 1));
  }

  // SSJ hair recolor
  const ssjRemap: Record<string, string> | undefined = isSuperSaiyan
    ? { "#1a1a2e": "#FFD700", "#1A1A2E": "#FFD700" }
    : undefined;

  if (facingLeft) {
    ctx.save();
    ctx.translate(x + spriteW, 0);
    ctx.scale(-1, 1);
    drawSprite(ctx, frame, 0, y, scale, ssjRemap);
    ctx.restore();
  } else {
    drawSprite(ctx, frame, x, y, scale, ssjRemap);
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Sprint afterimages
// ---------------------------------------------------------------------------

export function drawAfterimages(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollX: number,
  afterimages: { x: number; y: number; frameIndex: number; facingLeft: boolean; alpha: number; isSuperSaiyan: boolean }[],
  frames: string[][][],
  scale: number,
): void {
  const spriteW = 32 * scale;
  const spriteH = 32 * scale;

  for (const img of afterimages) {
    // Convert world position to screen position
    const screenX = w / 2 - spriteW / 2 - (scrollX - img.x);
    const screenY = h * PLAYER_Y_OFFSET - spriteH + img.y;

    // Skip if off screen
    if (screenX < -spriteW || screenX > w + spriteW) continue;

    ctx.save();
    ctx.globalAlpha = img.alpha;

    const frame = frames[img.frameIndex % frames.length];

    if (img.facingLeft) {
      ctx.save();
      ctx.translate(screenX + spriteW, 0);
      ctx.scale(-1, 1);
      drawSprite(ctx, frame, 0, screenY, scale);
      ctx.restore();
    } else {
      drawSprite(ctx, frame, screenX, screenY, scale);
    }

    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// 21. Enemies
// ---------------------------------------------------------------------------

interface EnemyRuntimeState {
  x: number;
  dir: number;
  alive: boolean;
  deathTimer: number;
}

const ENEMY_COLORS: Record<string, { body: string; accent: string }> = {
  saibaman: { body: "#4ADE80", accent: "#166534" },
  frieza_soldier: { body: "#A78BFA", accent: "#4C1D95" },
  cell_jr: { body: "#60A5FA", accent: "#1E3A5F" },
};

export function drawEnemies(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollX: number,
  enemies: EnemyRuntimeState[],
  defs: EnemyDef[],
): void {
  const groundY = h * GROUND_Y_RATIO;
  const speed = PARALLAX_SPEEDS.ground;

  for (let i = 0; i < enemies.length; i++) {
    const es = enemies[i];
    const def = defs[i];
    if (!es.alive && es.deathTimer <= 0) continue;

    const screenX = es.x - scrollX * speed;
    if (screenX < -50 || screenX > w + 50) continue;

    const colors = ENEMY_COLORS[def.type] ?? ENEMY_COLORS.saibaman;
    const now = Date.now();

    if (!es.alive) {
      // Death animation — flash and shrink
      const t = es.deathTimer / 30;
      const alpha = t;
      const scale = t;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(screenX, groundY);
      ctx.scale(scale, scale);
      ctx.translate(-screenX, -groundY);
      drawEnemySprite(ctx, screenX, groundY, colors, es.dir, now);
      ctx.restore();

      // Death explosion particles
      ctx.fillStyle = `rgba(255, 140, 0, ${t * 0.5})`;
      for (let j = 0; j < 4; j++) {
        const angle = (j / 4) * Math.PI * 2 + now / 200;
        const dist = (1 - t) * 30;
        ctx.beginPath();
        ctx.arc(
          screenX + Math.cos(angle) * dist,
          groundY - 12 + Math.sin(angle) * dist,
          3 * t,
          0, Math.PI * 2,
        );
        ctx.fill();
      }
      continue;
    }

    drawEnemySprite(ctx, screenX, groundY, colors, es.dir, now);
  }
}

function drawEnemySprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  colors: { body: string; accent: string },
  dir: number,
  now: number,
): void {
  const bob = Math.sin(now / 200) * 2;
  const bodyY = groundY - 24 + bob;

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(x, groundY, 10, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body (rectangle with rounded look)
  ctx.fillStyle = colors.body;
  ctx.fillRect(x - 6, bodyY, 12, 16);

  // Head
  ctx.beginPath();
  ctx.arc(x, bodyY - 2, 7, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (looking in patrol direction)
  ctx.fillStyle = "#FF0000";
  const eyeOffX = dir * 2;
  ctx.fillRect(x + eyeOffX - 3, bodyY - 4, 2, 2);
  ctx.fillRect(x + eyeOffX + 1, bodyY - 4, 2, 2);

  // Legs (animated)
  const legPhase = Math.sin(now / 100) * 3;
  ctx.fillStyle = colors.accent;
  ctx.fillRect(x - 4, bodyY + 16, 3, 6 + legPhase);
  ctx.fillRect(x + 1, bodyY + 16, 3, 6 - legPhase);

  // Arms
  const armAngle = Math.sin(now / 150) * 0.3;
  ctx.strokeStyle = colors.body;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 6, bodyY + 4);
  ctx.lineTo(x - 10, bodyY + 10 + Math.sin(armAngle) * 3);
  ctx.moveTo(x + 6, bodyY + 4);
  ctx.lineTo(x + 10, bodyY + 10 - Math.sin(armAngle) * 3);
  ctx.stroke();
}

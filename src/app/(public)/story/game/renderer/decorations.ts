/**
 * World decorations and collectibles for the renderer.
 */

import {
  SENZU_SPRITE,
  DRAGON_BALL_SPRITE,
  NIMBUS_SPRITE,
} from "../sprite-data";
import { PARALLAX_SPEEDS } from "../world-data";
import type { Decoration } from "../world-data";
import { GROUND_Y_RATIO } from "./helpers";
import { drawSprite } from "./characters";

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

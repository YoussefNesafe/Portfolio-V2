/**
 * HUD elements and text overlays for the renderer.
 */

import type { Decoration } from "../world-data";
import type { IStoryBiome } from "@/app/models/IStoryDictionary";

// ---------------------------------------------------------------------------
// 9. Draw scouter HUD
// ---------------------------------------------------------------------------

export function drawScouter(
  ctx: CanvasRenderingContext2D,
  w: number,
  powerLevel: number,
  dragonBallCount: number = 0,
  enemiesKilled: number = 0,
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

  // Kill counter — top-right of scouter box
  if (enemiesKilled > 0) {
    ctx.font = `${labelSize}px monospace`;
    ctx.fillStyle = "#ef4444";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText(`⚔ ${enemiesKilled}`, boxX + boxW - pad, boxY + pad);
  }
}

// ---------------------------------------------------------------------------
// Dragon Ball radar arrow
// ---------------------------------------------------------------------------

export function drawDragonBallRadar(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollX: number,
  collectedSet: Set<number>,
  decorations: Decoration[],
): void {
  // Find nearest uncollected dragon ball
  const playerWorldX = scrollX + w / 2;
  let nearest: { x: number; dist: number; star: number } | null = null;

  for (let i = 0; i < decorations.length; i++) {
    const dec = decorations[i];
    if (dec.type !== "dragonball" || collectedSet.has(i)) continue;
    const dist = dec.x - playerWorldX;
    if (nearest === null || Math.abs(dist) < Math.abs(nearest.dist)) {
      nearest = { x: dec.x, dist, star: dec.star ?? 0 };
    }
  }

  if (!nearest) return;

  // Only show arrow if dragon ball is off-screen
  const screenX = nearest.x - scrollX;
  if (screenX > 30 && screenX < w - 30) return;

  const isRight = nearest.dist > 0;
  const arrowX = isRight ? w - 25 : 25;
  const arrowY = h * 0.15;

  const now = Date.now();
  const pulse = 0.6 + Math.sin(now * 0.005) * 0.3;

  // Arrow triangle
  ctx.save();
  ctx.translate(arrowX, arrowY);
  if (!isRight) ctx.scale(-1, 1);

  ctx.fillStyle = `rgba(255, 165, 0, ${pulse})`;
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.lineTo(-4, -8);
  ctx.lineTo(-4, 8);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // Star count label below arrow
  ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(`${nearest.star}★`, arrowX, arrowY + 12);

  // Distance indicator
  const distLabel = Math.abs(Math.round(nearest.dist / 100));
  ctx.fillStyle = `rgba(255, 165, 0, ${pulse * 0.7})`;
  ctx.font = "9px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`${distLabel}m`, arrowX, arrowY + 26);
}

// ---------------------------------------------------------------------------
// 20. Controls hint
// ---------------------------------------------------------------------------

export function drawControlsHint(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  const fontSize = Math.max(Math.round(w * 0.007), 9);
  ctx.font = `${fontSize}px monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
  const pad = Math.round(w * 0.01);
  const lineH = fontSize + 2;
  const baseY = h - pad;
  const lines = [
    "Arrows: Move | Space: Jump/Fly | Shift: Sprint",
    "X: Kamehameha | C: Teleport | Down: Crouch",
  ];
  for (let i = lines.length - 1; i >= 0; i--) {
    ctx.fillText(lines[i], pad, baseY - (lines.length - 1 - i) * lineH);
  }
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
// 22. Milestone text (power level milestones)
// ---------------------------------------------------------------------------

export function drawMilestoneText(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  text: string,
  timer: number,
): void {
  if (!text || timer <= 0) return;

  const alpha = Math.min(1, timer / 30);
  const scale = 1 + (1 - Math.min(1, timer / 20)) * 0.3; // pop-in effect
  const fontSize = Math.max(Math.round(w * 0.025), 20);
  const now = Date.now();

  ctx.save();
  ctx.translate(w / 2, h * 0.4);
  ctx.scale(scale, scale);

  // Glow
  ctx.shadowBlur = 25;
  ctx.shadowColor = "#FF6B00";
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Pulsing color
  const pulse = Math.sin(now / 80) > 0;
  ctx.fillStyle = pulse
    ? `rgba(255, 215, 0, ${alpha})`
    : `rgba(255, 100, 0, ${alpha})`;
  ctx.fillText(text, 0, 0);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 19. Wish screen (all 7 Dragon Balls collected)
// ---------------------------------------------------------------------------

export function drawWishScreen(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  timer: number,
): void {
  const fadeIn = Math.min(1, timer / 60);
  const now = Date.now();

  // Dark overlay
  ctx.fillStyle = `rgba(0, 0, 0, ${fadeIn * 0.85})`;
  ctx.fillRect(0, 0, w, h);

  // Golden glow in center
  const glowPulse = 0.3 + Math.sin(now / 300) * 0.15;
  const glowGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.35);
  glowGrad.addColorStop(0, `rgba(255, 215, 0, ${glowPulse * fadeIn})`);
  glowGrad.addColorStop(0.5, `rgba(255, 140, 0, ${glowPulse * 0.3 * fadeIn})`);
  glowGrad.addColorStop(1, "rgba(255, 69, 0, 0)");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Dragon Balls in circle
  if (timer > 30) {
    const dbFade = Math.min(1, (timer - 30) / 40);
    const radius = Math.min(w, h) * 0.15;
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2 - Math.PI / 2 + now / 3000;
      const bx = w / 2 + Math.cos(angle) * radius;
      const by = h / 2 + Math.sin(angle) * radius;

      // Glow
      const bgGrad = ctx.createRadialGradient(bx, by, 0, bx, by, 15);
      bgGrad.addColorStop(0, `rgba(255, 140, 0, ${0.6 * dbFade})`);
      bgGrad.addColorStop(1, "rgba(255, 140, 0, 0)");
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(bx, by, 15, 0, Math.PI * 2);
      ctx.fill();

      // Ball
      ctx.fillStyle = `rgba(255, 160, 30, ${dbFade})`;
      ctx.beginPath();
      ctx.arc(bx, by, 8, 0, Math.PI * 2);
      ctx.fill();

      // Star count
      ctx.fillStyle = `rgba(180, 40, 0, ${dbFade})`;
      ctx.font = "bold 8px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${i + 1}`, bx, by + 1);
    }
  }

  // Title text
  if (timer > 60) {
    const textFade = Math.min(1, (timer - 60) / 40);
    const fontSize = Math.max(Math.round(w * 0.03), 24);
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#FFD700";
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = `rgba(255, 215, 0, ${textFade})`;
    ctx.fillText("ALL DRAGON BALLS COLLECTED!", w / 2, h * 0.25);
    ctx.restore();
  }

  // Subtitle
  if (timer > 100) {
    const subFade = Math.min(1, (timer - 100) / 40);
    const subSize = Math.max(Math.round(w * 0.014), 14);
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#FF6B00";
    ctx.font = `${subSize}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = `rgba(255, 200, 100, ${subFade})`;
    ctx.fillText("Your wish has been granted...", w / 2, h * 0.72);
    ctx.restore();
  }

  // "Press any key" after a while
  if (timer > 180) {
    const blink = Math.sin(now / 400) > 0 ? 1 : 0.3;
    const hintSize = Math.max(Math.round(w * 0.01), 12);
    ctx.font = `${hintSize}px monospace`;
    ctx.textAlign = "center";
    ctx.fillStyle = `rgba(200, 200, 200, ${blink})`;
    ctx.fillText("Press any key to continue...", w / 2, h * 0.85);
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

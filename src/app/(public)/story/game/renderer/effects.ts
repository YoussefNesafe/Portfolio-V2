/**
 * Visual effects and flashes for the renderer.
 */

// ---------------------------------------------------------------------------
// 15. Kamehameha beam
// ---------------------------------------------------------------------------

export function drawKamehameha(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  playerX: number,
  playerY: number,
  playerScale: number,
  facingLeft: boolean,
  timer: number,
  maxTimer: number,
  isSuperSaiyan: boolean,
): void {
  const progress = 1 - timer / maxTimer; // 0→1 as blast progresses
  const spriteW = 32 * playerScale;
  const spriteH = 32 * playerScale;
  const centerY = playerY + spriteH * 0.45;
  const startX = facingLeft ? playerX : playerX + spriteW;
  const dir = facingLeft ? -1 : 1;
  const beamLen = progress * w * 0.8;
  const beamWidth = 8 + progress * 12;
  const now = Date.now();

  // Charge glow at hands
  const chargeRadius = 10 + Math.sin(now / 50) * 3;
  const chargeGrad = ctx.createRadialGradient(
    startX, centerY, 0,
    startX, centerY, chargeRadius,
  );
  if (isSuperSaiyan) {
    chargeGrad.addColorStop(0, "rgba(255, 215, 0, 0.9)");
    chargeGrad.addColorStop(0.5, "rgba(255, 140, 0, 0.5)");
    chargeGrad.addColorStop(1, "rgba(255, 69, 0, 0)");
  } else {
    chargeGrad.addColorStop(0, "rgba(150, 200, 255, 0.9)");
    chargeGrad.addColorStop(0.5, "rgba(59, 130, 246, 0.5)");
    chargeGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
  }
  ctx.fillStyle = chargeGrad;
  ctx.beginPath();
  ctx.arc(startX, centerY, chargeRadius, 0, Math.PI * 2);
  ctx.fill();

  // Main beam
  const beamGrad = ctx.createLinearGradient(startX, centerY - beamWidth, startX, centerY + beamWidth);
  if (isSuperSaiyan) {
    beamGrad.addColorStop(0, "rgba(255, 215, 0, 0)");
    beamGrad.addColorStop(0.3, "rgba(255, 200, 50, 0.7)");
    beamGrad.addColorStop(0.5, "rgba(255, 255, 200, 0.9)");
    beamGrad.addColorStop(0.7, "rgba(255, 200, 50, 0.7)");
    beamGrad.addColorStop(1, "rgba(255, 215, 0, 0)");
  } else {
    beamGrad.addColorStop(0, "rgba(59, 130, 246, 0)");
    beamGrad.addColorStop(0.3, "rgba(100, 180, 255, 0.7)");
    beamGrad.addColorStop(0.5, "rgba(200, 230, 255, 0.9)");
    beamGrad.addColorStop(0.7, "rgba(100, 180, 255, 0.7)");
    beamGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
  }
  ctx.fillStyle = beamGrad;
  ctx.fillRect(
    facingLeft ? startX - beamLen : startX,
    centerY - beamWidth / 2,
    beamLen,
    beamWidth,
  );

  // Core beam (bright center)
  ctx.fillStyle = isSuperSaiyan
    ? `rgba(255, 255, 200, ${0.8 - progress * 0.3})`
    : `rgba(220, 240, 255, ${0.8 - progress * 0.3})`;
  ctx.fillRect(
    facingLeft ? startX - beamLen : startX,
    centerY - beamWidth / 6,
    beamLen,
    beamWidth / 3,
  );

  // Impact flash at beam tip
  const tipX = startX + dir * beamLen;
  const impactPulse = 0.5 + Math.sin(now / 40) * 0.3;
  const impactGrad = ctx.createRadialGradient(tipX, centerY, 0, tipX, centerY, 20);
  impactGrad.addColorStop(0, `rgba(255, 255, 255, ${impactPulse})`);
  impactGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = impactGrad;
  ctx.beginPath();
  ctx.arc(tipX, centerY, 20, 0, Math.PI * 2);
  ctx.fill();
}

// ---------------------------------------------------------------------------
// 18. Dust particles (landing impact)
// ---------------------------------------------------------------------------

export function drawDustParticles(
  ctx: CanvasRenderingContext2D,
  particles: { x: number; y: number; life: number }[],
): void {
  for (const p of particles) {
    const alpha = Math.min(1, p.life / 15) * 0.6;
    const size = 2 + (1 - p.life / 35) * 3;
    ctx.fillStyle = `rgba(180, 160, 120, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Weather particles
// ---------------------------------------------------------------------------

export function drawWeatherParticles(
  ctx: CanvasRenderingContext2D,
  particles: { x: number; y: number; size: number; life: number; type: "rain" | "leaf" | "snow" }[],
): void {
  for (const p of particles) {
    const alpha = Math.min(1, p.life / 20);
    if (p.type === "rain") {
      ctx.strokeStyle = `rgba(150, 200, 255, ${alpha * 0.4})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 0.5, p.y + 6);
      ctx.stroke();
    } else if (p.type === "leaf") {
      ctx.fillStyle = `rgba(34, 197, 94, ${alpha * 0.6})`;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size, p.size * 0.5, Math.sin(p.life * 0.1) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // snow/stardust
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ---------------------------------------------------------------------------
// Shooting stars
// ---------------------------------------------------------------------------

export function drawShootingStars(
  ctx: CanvasRenderingContext2D,
  stars: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; length: number }[],
): void {
  for (const star of stars) {
    const alpha = star.life / star.maxLife;
    const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
    const tailX = star.x - (star.vx / speed) * star.length;
    const tailY = star.y - (star.vy / speed) * star.length;

    const grad = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
    grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
    grad.addColorStop(1, `rgba(255, 255, 255, ${alpha * 0.8})`);

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(star.x, star.y);
    ctx.stroke();

    // Bright head
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// 16. Teleport flash
// ---------------------------------------------------------------------------

export function drawTeleportFlash(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number,
): void {
  if (intensity <= 0) return;
  // Cyan/white flash
  ctx.fillStyle = `rgba(6, 182, 212, ${Math.min(0.4, intensity * 0.4)})`;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.3, intensity * 0.3)})`;
  ctx.fillRect(0, 0, w, h);
}

// ---------------------------------------------------------------------------
// 17. Transform flash (golden)
// ---------------------------------------------------------------------------

export function drawTransformFlash(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number,
): void {
  if (intensity <= 0) return;
  ctx.fillStyle = `rgba(255, 215, 0, ${Math.min(0.6, intensity * 0.6)})`;
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

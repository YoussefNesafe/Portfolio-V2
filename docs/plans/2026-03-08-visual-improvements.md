# Visual Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 9 visual polish features to the Dragon Ball story mode: day/night cycle, weather particles, sprint afterimages, SSJ hair recolor, animated water/lava, shooting stars, parallax fog, kill counter HUD, and dragon ball radar arrow.

**Architecture:** All features are purely visual — they add new draw functions in `renderer.ts`, new state fields in `useGameLoop.ts`, and new particle/effect arrays. No changes to game mechanics, collision, or input handling. Each feature is independent and can be implemented in any order.

**Tech Stack:** HTML5 Canvas 2D API, TypeScript, React refs for state

---

## Reference: Key File Locations

| File | Purpose |
|------|---------|
| `src/app/(public)/story/game/renderer.ts` | All draw functions (pure, no React) |
| `src/app/(public)/story/game/useGameLoop.ts` | Game state, update loop, render calls |
| `src/app/(public)/story/game/world-data.ts` | Constants, decorations, enemies |
| `src/app/(public)/story/game/sprite-data.ts` | Pixel art sprite frames |
| `src/app/(public)/story/game/sound.ts` | Web Audio procedural sounds |
| `src/dictionaries/en.json` | Biome definitions (colors, startX) |

## Reference: Existing Architecture

- **Renderer** is a pure-functions module. Every exported function takes `ctx, w, h, scrollX, ...` and draws directly.
- **GameState** is a plain object in a `useRef`. No React re-renders during gameplay.
- **Biomes**: 4 biomes (origin 0-0.25, arsenal 0.25-0.50, works 0.50-0.75, vision 0.75-1.0) with color interpolation at boundaries.
- **Parallax speeds**: sky 0.1, mountains 0.3, midground 0.6, ground 1.0, foreground 1.2.
- **Player**: screen center (`w/2`), world pos = `scrollX + w/2`, feet at `h * 0.80`, sprite = 32x32 at scale 3 (96px tall).
- **drawScouter** at `renderer.ts:627` draws the HUD at top-right.
- **drawSkyLayer** at `renderer.ts:130` draws sky gradient + clouds.
- **drawGroundLayer** at `renderer.ts:262` draws ground fill + surface line.
- **drawPlayer** at `renderer.ts:474` draws sprite + aura + effects.
- **Render order** in `useGameLoop.ts:522-607`: sky → sky decorations → mountains → mountain decorations → midground → midground decorations → floating text → ground → ground decorations → enemies → player → kamehameha → dust → foreground → foreground decorations → HUD → controls hint → milestone text → pickup text → flashes.

---

### Task 1: Day/Night Cycle Tint

Add a time-of-day tint overlay that shifts based on world progress: dawn (biome 1) → midday (biome 2) → sunset (biome 3) → night (biome 4).

**Files:**
- Modify: `src/app/(public)/story/game/renderer.ts` — add `drawDayNightTint` function
- Modify: `src/app/(public)/story/game/useGameLoop.ts` — call `drawDayNightTint` after sky layer

**Step 1: Add `drawDayNightTint` to renderer.ts**

Add this function after `drawSkyLayer` (after line 164):

```typescript
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
  // Each biome boundary triggers a transition
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
```

**Step 2: Call `drawDayNightTint` in useGameLoop.ts render function**

In `useGameLoop.ts`, after the `renderer.drawSkyLayer(...)` call (line 523), add:

```typescript
renderer.drawDayNightTint(ctx, w, h, s.scrollX);
```

**Step 3: Run build to verify**

Run: `npx next build`
Expected: Build succeeds with no type errors.

**Step 4: Commit**

```bash
git add src/app/\(public\)/story/game/renderer.ts src/app/\(public\)/story/game/useGameLoop.ts
git commit -m "feat(story): add day/night cycle tint overlay"
```

---

### Task 2: Weather Particles

Add biome-specific weather: light rain in biome 2 (arsenal/tech), falling leaves in biome 3 (works/arena), snow/stardust in biome 4 (vision/space).

**Files:**
- Modify: `src/app/(public)/story/game/renderer.ts` — add `drawWeatherParticles` function
- Modify: `src/app/(public)/story/game/useGameLoop.ts` — add weather particle state, update logic, render call

**Step 1: Add weather particle state to GameState in useGameLoop.ts**

Add to the `GameState` interface (after `milestoneTimer: number;` around line 90):

```typescript
// Weather
weatherParticles: WeatherParticle[];
```

Add the `WeatherParticle` interface after `EnemyState` (around line 37):

```typescript
interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  type: "rain" | "leaf" | "snow";
}
```

Initialize in `stateRef` default (after `milestoneTimer: 0`):

```typescript
weatherParticles: [],
```

**Step 2: Add weather particle update logic in useGameLoop.ts**

Add this block in the `update` callback, after the milestone timer decrement (after `if (s.milestoneTimer > 0) s.milestoneTimer--;` around line 485):

```typescript
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
    p.vx += Math.sin(p.life * 0.1) * 0.1; // leaf sway
  }
  if (p.type === "snow") {
    p.vx += Math.sin(p.life * 0.05) * 0.05; // gentle drift
  }
  p.life--;
  return p.life > 0 && p.y < canvasHW;
});
```

**Step 3: Add `drawWeatherParticles` to renderer.ts**

Add after the `drawDayNightTint` function:

```typescript
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
```

**Step 4: Call `drawWeatherParticles` in useGameLoop.ts render function**

Add after `renderer.drawForegroundLayer(...)` call (around line 570), before the foreground decorations:

```typescript
// Weather
if (s.weatherParticles.length > 0) {
  renderer.drawWeatherParticles(ctx, s.weatherParticles);
}
```

**Step 5: Run build to verify**

Run: `npx next build`
Expected: Build succeeds.

**Step 6: Commit**

```bash
git add src/app/\(public\)/story/game/renderer.ts src/app/\(public\)/story/game/useGameLoop.ts
git commit -m "feat(story): add biome-specific weather particles (rain, leaves, snow)"
```

---

### Task 3: Sprint Afterimages

Draw semi-transparent ghost copies of the player trailing behind during sprint.

**Files:**
- Modify: `src/app/(public)/story/game/renderer.ts` — add `drawAfterimages` function
- Modify: `src/app/(public)/story/game/useGameLoop.ts` — add afterimage state, update logic, render call

**Step 1: Add afterimage state to GameState in useGameLoop.ts**

Add interface after `WeatherParticle`:

```typescript
interface Afterimage {
  x: number;
  y: number;
  frameIndex: number;
  facingLeft: boolean;
  alpha: number;
  isSuperSaiyan: boolean;
}
```

Add to `GameState` interface:

```typescript
// Afterimages
afterimages: Afterimage[];
```

Initialize in `stateRef`:

```typescript
afterimages: [],
```

**Step 2: Add afterimage spawning in update logic**

Add after the footstep dust block (around line 426, after the closing `}` of the footstep dust `if`):

```typescript
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
```

**Step 3: Add `drawAfterimages` to renderer.ts**

Add after `drawWeatherParticles`:

```typescript
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

    // Tint color — gold for SSJ, cyan otherwise
    const tint = img.isSuperSaiyan ? "rgba(255, 215, 0, 0.3)" : "rgba(6, 182, 212, 0.3)";

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

    // Apply tint overlay
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = tint;
    ctx.fillRect(screenX, screenY, spriteW, spriteH);
    ctx.globalCompositeOperation = "source-over";

    ctx.restore();
  }
}
```

**Note:** The `source-atop` composite only applies over already-drawn afterimage pixels within the `ctx.save()/restore()` block, so it won't affect the rest of the canvas.

**Step 4: Call `drawAfterimages` in useGameLoop.ts render**

Add BEFORE the `renderer.drawPlayer(...)` call (around line 542):

```typescript
// Sprint afterimages
if (s.afterimages.length > 0) {
  renderer.drawAfterimages(ctx, w, h, s.scrollX, s.afterimages, frames, playerScale);
}
```

**Step 5: Run build to verify**

Run: `npx next build`
Expected: Build succeeds.

**Step 6: Commit**

```bash
git add src/app/\(public\)/story/game/renderer.ts src/app/\(public\)/story/game/useGameLoop.ts
git commit -m "feat(story): add sprint afterimage ghost trail"
```

---

### Task 4: SSJ Hair Recolor

When Super Saiyan, recolor the dark hair pixels (#1a1a2e) to golden (#FFD700) in the sprite.

**Files:**
- Modify: `src/app/(public)/story/game/renderer.ts` — modify `drawSprite` to accept optional color remap
- Modify: `src/app/(public)/story/game/useGameLoop.ts` — pass SSJ flag to drawPlayer

**Step 1: Modify `drawSprite` in renderer.ts to support color remapping**

Current `drawSprite` signature at line 453:

```typescript
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  frame: string[][],
  x: number,
  y: number,
  scale: number,
): void {
```

Change to:

```typescript
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  frame: string[][],
  x: number,
  y: number,
  scale: number,
  colorRemap?: Record<string, string>,
): void {
```

Inside `drawSprite`, the pixel drawing loop currently sets `ctx.fillStyle = pixel;`. Change that line to:

```typescript
ctx.fillStyle = colorRemap?.[pixel] ?? pixel;
```

**Step 2: Pass color remap when SSJ in `drawPlayer`**

In `drawPlayer` (renderer.ts), the sprite drawing section around lines 610-618 calls `drawSprite`. Add a remap constant before the drawing:

```typescript
// SSJ hair recolor
const ssjRemap: Record<string, string> | undefined = isSuperSaiyan
  ? { "#1a1a2e": "#FFD700", "#1A1A2E": "#FFD700" }
  : undefined;
```

Then change both `drawSprite` calls in `drawPlayer` to pass `ssjRemap`:

```typescript
// Line ~614 (facingLeft branch):
drawSprite(ctx, frame, 0, y, scale, ssjRemap);

// Line ~617 (normal branch):
drawSprite(ctx, frame, x, y, scale, ssjRemap);
```

**Step 3: Run build to verify**

Run: `npx next build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/app/\(public\)/story/game/renderer.ts
git commit -m "feat(story): recolor hair to golden when Super Saiyan"
```

---

### Task 5: Animated Water/Lava Surface

Draw a flowing animated surface effect on top of the ground in specific biomes: water ripples in biome 1 (origin), tech grid lines in biome 2 (arsenal), lava glow in biome 3 (works).

**Files:**
- Modify: `src/app/(public)/story/game/renderer.ts` — add `drawGroundSurface` function
- Modify: `src/app/(public)/story/game/useGameLoop.ts` — call `drawGroundSurface`

**Step 1: Add `drawGroundSurface` to renderer.ts**

Add after `drawGroundLayer`:

```typescript
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
  // Biome 4 (space): no ground surface effect — clean dark surface
}
```

**Step 2: Call `drawGroundSurface` in useGameLoop.ts render**

After `renderer.drawGroundLayer(...)` (line 530), before ground decorations:

```typescript
renderer.drawGroundSurface(ctx, w, h, s.scrollX);
```

**Step 3: Run build to verify**

Run: `npx next build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/app/\(public\)/story/game/renderer.ts src/app/\(public\)/story/game/useGameLoop.ts
git commit -m "feat(story): add animated ground surface effects per biome"
```

---

### Task 6: Shooting Stars (Biome 4)

Draw diagonal streaks across the sky in biome 4 (space theme).

**Files:**
- Modify: `src/app/(public)/story/game/renderer.ts` — add `drawShootingStars` function
- Modify: `src/app/(public)/story/game/useGameLoop.ts` — add shooting star state, update, render

**Step 1: Add shooting star state to GameState**

Add interface:

```typescript
interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  length: number;
}
```

Add to `GameState`:

```typescript
shootingStars: ShootingStar[];
```

Initialize:

```typescript
shootingStars: [],
```

**Step 2: Add shooting star spawning + update in update callback**

Add after the weather particles update block:

```typescript
// Shooting stars — biome 4 only
if (progress >= 0.75 && Math.random() < 0.02) {
  const startX = Math.random() * canvasWW;
  s.shootingStars.push({
    x: startX,
    y: Math.random() * canvasHW * 0.4,
    vx: -(4 + Math.random() * 6),
    vy: 3 + Math.random() * 4,
    life: 30 + Math.random() * 20,
    maxLife: 30 + Math.random() * 20,
    length: 20 + Math.random() * 30,
  });
  // Fix maxLife to equal life
  const last = s.shootingStars[s.shootingStars.length - 1];
  last.maxLife = last.life;
}
s.shootingStars = s.shootingStars.filter((star) => {
  star.x += star.vx;
  star.y += star.vy;
  star.life--;
  return star.life > 0;
});
```

**Step 3: Add `drawShootingStars` to renderer.ts**

```typescript
// ---------------------------------------------------------------------------
// Shooting stars
// ---------------------------------------------------------------------------

export function drawShootingStars(
  ctx: CanvasRenderingContext2D,
  stars: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; length: number }[],
): void {
  for (const star of stars) {
    const alpha = star.life / star.maxLife;
    const tailX = star.x - (star.vx / Math.sqrt(star.vx * star.vx + star.vy * star.vy)) * star.length;
    const tailY = star.y - (star.vy / Math.sqrt(star.vx * star.vx + star.vy * star.vy)) * star.length;

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
```

**Step 4: Call `drawShootingStars` in render**

After the sky decorations call (line 524), add:

```typescript
// Shooting stars (biome 4)
if (s.shootingStars.length > 0) {
  renderer.drawShootingStars(ctx, s.shootingStars);
}
```

**Step 5: Run build to verify**

Run: `npx next build`
Expected: Build succeeds.

**Step 6: Commit**

```bash
git add src/app/\(public\)/story/game/renderer.ts src/app/\(public\)/story/game/useGameLoop.ts
git commit -m "feat(story): add shooting stars in biome 4 (space)"
```

---

### Task 7: Deeper Parallax Fog

Add semi-transparent fog layers between parallax planes for depth.

**Files:**
- Modify: `src/app/(public)/story/game/renderer.ts` — add `drawParallaxFog` function
- Modify: `src/app/(public)/story/game/useGameLoop.ts` — call fog at 3 insertion points

**Step 1: Add `drawParallaxFog` to renderer.ts**

```typescript
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

  // Each layer gets different opacity and vertical position
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
```

**Step 2: Call fog layers at correct insertion points in useGameLoop.ts render**

Add `"far"` fog after mountain decorations (after line 526):

```typescript
renderer.drawParallaxFog(ctx, w, h, s.scrollX, biomes, "far");
```

Add `"mid"` fog after midground decorations (after line 528):

```typescript
renderer.drawParallaxFog(ctx, w, h, s.scrollX, biomes, "mid");
```

Add `"near"` fog after floating text, before ground layer (before line 530):

```typescript
renderer.drawParallaxFog(ctx, w, h, s.scrollX, biomes, "near");
```

**Step 3: Run build to verify**

Run: `npx next build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/app/\(public\)/story/game/renderer.ts src/app/\(public\)/story/game/useGameLoop.ts
git commit -m "feat(story): add parallax fog layers for depth"
```

---

### Task 8: Kill Counter HUD

Show `enemiesKilled` count in the scouter HUD.

**Files:**
- Modify: `src/app/(public)/story/game/renderer.ts` — modify `drawScouter` to accept and display kill count
- Modify: `src/app/(public)/story/game/useGameLoop.ts` — pass kill count to drawScouter

**Step 1: Update `drawScouter` signature in renderer.ts**

Change the function signature at line 627 from:

```typescript
export function drawScouter(
  ctx: CanvasRenderingContext2D,
  w: number,
  powerLevel: number,
  dragonBallCount: number = 0,
): void {
```

To:

```typescript
export function drawScouter(
  ctx: CanvasRenderingContext2D,
  w: number,
  powerLevel: number,
  dragonBallCount: number = 0,
  enemiesKilled: number = 0,
): void {
```

**Step 2: Add kill count display inside `drawScouter`**

After the dragon ball counter block (after line 688, before the closing `}`), add:

```typescript
// Kill counter — below dragon ball counter
if (enemiesKilled > 0) {
  ctx.font = `${labelSize}px monospace`;
  ctx.fillStyle = "#ef4444";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText(`⚔ ${enemiesKilled}`, boxX + boxW - pad, boxY + pad);
}
```

**Step 3: Pass kill count in useGameLoop.ts render**

Change line 574:

```typescript
renderer.drawScouter(ctx, w, s.powerLevel, s.collectedDragonBalls.size);
```

To:

```typescript
renderer.drawScouter(ctx, w, s.powerLevel, s.collectedDragonBalls.size, s.enemiesKilled);
```

**Step 4: Run build to verify**

Run: `npx next build`
Expected: Build succeeds.

**Step 5: Commit**

```bash
git add src/app/\(public\)/story/game/renderer.ts src/app/\(public\)/story/game/useGameLoop.ts
git commit -m "feat(story): add kill counter to scouter HUD"
```

---

### Task 9: Dragon Ball Radar Arrow

Draw an arrow at the screen edge pointing toward the nearest uncollected dragon ball.

**Files:**
- Modify: `src/app/(public)/story/game/renderer.ts` — add `drawDragonBallRadar` function
- Modify: `src/app/(public)/story/game/useGameLoop.ts` — call radar after HUD

**Step 1: Add `drawDragonBallRadar` to renderer.ts**

```typescript
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

  // Star count label
  ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  if (!isRight) ctx.scale(-1, 1); // un-mirror text
  const textX = isRight ? 0 : 0;
  ctx.fillText(`${nearest.star}★`, textX, 12);

  ctx.restore();

  // Distance indicator (in world units / 100)
  const distLabel = Math.abs(Math.round(nearest.dist / 100));
  ctx.fillStyle = `rgba(255, 165, 0, ${pulse * 0.7})`;
  ctx.font = "9px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`${distLabel}m`, arrowX, arrowY + 26);
}
```

**Step 2: Call `drawDragonBallRadar` in useGameLoop.ts render**

After the scouter HUD call (after `renderer.drawScouter(...)`, around line 574):

```typescript
// Dragon Ball radar
renderer.drawDragonBallRadar(ctx, w, h, s.scrollX, s.collectedSet, DECORATIONS);
```

**Step 3: Run build to verify**

Run: `npx next build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/app/\(public\)/story/game/renderer.ts src/app/\(public\)/story/game/useGameLoop.ts
git commit -m "feat(story): add dragon ball radar arrow pointing to nearest uncollected ball"
```

---

## Final Verification

After all 9 tasks are complete:

1. Run `npx next build` — should succeed with no errors
2. Run `npm run dev` and navigate to the story mode
3. Verify visually:
   - Dawn tint fades as you move right, sunset appears around biome 3, night in biome 4
   - Rain falls in biome 2, leaves in biome 3, snow in biome 4
   - Sprint creates ghost trail behind player
   - SSJ hair turns golden
   - Ground surface has animated effects (water ripples, grid, lava)
   - Shooting stars streak across sky in biome 4
   - Subtle fog between parallax layers
   - Kill count appears in scouter after defeating an enemy
   - Orange arrow points toward nearest uncollected dragon ball

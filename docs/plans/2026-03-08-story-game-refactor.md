# Story Game Engine Refactoring Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Decompose the /story page game engine into focused, maintainable modules without changing any behavior.

**Architecture:** Split monolithic `renderer.ts` (1852 lines) into 6 domain-specific modules under `renderer/`. Decompose `useGameLoop.ts` (758 lines) by extracting game state types + factory into `game-state.ts`, magic numbers into `game-constants.ts`, and update logic into 5 focused modules under `update/`. Add canvas error handling in `StoryCanvas.tsx`.

**Tech Stack:** TypeScript, React 19 (hooks, refs), HTML5 Canvas API, Web Audio API

---

### Task 1: Create `game-state.ts` — types and initial state factory

**Files:**
- Create: `src/app/(public)/story/game/game-state.ts`

**Step 1: Create file with all particle/entity interfaces and nested GameState**

Extract from `useGameLoop.ts` lines 23-126: `DustParticle`, `EnemyState`, `WeatherParticle`, `Afterimage`, `ShootingStar`. Then restructure `GameState` into nested sub-objects and add `createInitialState()`.

```ts
import { ENEMIES } from "./world-data";

// ---------------------------------------------------------------------------
// Particle / entity types
// ---------------------------------------------------------------------------

export interface DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export interface EnemyState {
  x: number;
  dir: number;
  alive: boolean;
  deathTimer: number;
}

export interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  type: "rain" | "leaf" | "snow";
}

export interface Afterimage {
  x: number;
  y: number;
  frameIndex: number;
  facingLeft: boolean;
  alpha: number;
  isSuperSaiyan: boolean;
}

export interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  length: number;
}

// ---------------------------------------------------------------------------
// Input state (matches usePlayerInput)
// ---------------------------------------------------------------------------

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
  down: boolean;
  blast: boolean;
  teleport: boolean;
}

// ---------------------------------------------------------------------------
// Nested game state
// ---------------------------------------------------------------------------

export interface MovementState {
  scrollX: number;
  velocity: number;
  jumpVelocity: number;
  jumpY: number;
  isGrounded: boolean;
  jumpCount: number;
  facingLeft: boolean;
  isSprinting: boolean;
  isCrouching: boolean;
  isFlying: boolean;
}

export interface AnimationState {
  frameIndex: number;
  frameTick: number;
}

export interface CombatState {
  blastActive: boolean;
  blastTimer: number;
  teleportFlash: number;
  teleportCooldown: number;
  enemies: EnemyState[];
  enemiesKilled: number;
}

export interface CollectiblesState {
  collectedDragonBalls: Set<number>;
  collectedSenzu: number;
  collectedKiOrbs: number;
  collectedSet: Set<number>;
}

export interface PowerState {
  powerLevel: number;
  powerUpFlash: number;
  isSuperSaiyan: boolean;
  transformTimer: number;
  transformFlash: number;
  transformTriggered: boolean;
}

export interface EffectsState {
  dustParticles: DustParticle[];
  screenShake: number;
  afterimages: Afterimage[];
  weatherParticles: WeatherParticle[];
  shootingStars: ShootingStar[];
  wishActive: boolean;
  wishTimer: number;
}

export interface UIState {
  pickupFlash: number;
  pickupText: string;
  pickupTextTimer: number;
  milestoneShown: Set<number>;
  milestoneText: string;
  milestoneTimer: number;
}

export interface WorldState {
  lastBiomeIndex: number;
  started: boolean;
  finished: boolean;
  wasAirborne: boolean;
  prevJumpY: number;
}

export interface GameState {
  movement: MovementState;
  animation: AnimationState;
  combat: CombatState;
  collectibles: CollectiblesState;
  power: PowerState;
  effects: EffectsState;
  ui: UIState;
  world: WorldState;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createInitialState(): GameState {
  return {
    movement: {
      scrollX: 0,
      velocity: 0,
      jumpVelocity: 0,
      jumpY: 0,
      isGrounded: true,
      jumpCount: 0,
      facingLeft: false,
      isSprinting: false,
      isCrouching: false,
      isFlying: false,
    },
    animation: {
      frameIndex: 0,
      frameTick: 0,
    },
    combat: {
      blastActive: false,
      blastTimer: 0,
      teleportFlash: 0,
      teleportCooldown: 0,
      enemies: ENEMIES.map((e) => ({ x: e.x, dir: 1, alive: true, deathTimer: 0 })),
      enemiesKilled: 0,
    },
    collectibles: {
      collectedDragonBalls: new Set(),
      collectedSenzu: 0,
      collectedKiOrbs: 0,
      collectedSet: new Set(),
    },
    power: {
      powerLevel: 0,
      powerUpFlash: 0,
      isSuperSaiyan: false,
      transformTimer: 0,
      transformFlash: 0,
      transformTriggered: false,
    },
    effects: {
      dustParticles: [],
      screenShake: 0,
      afterimages: [],
      weatherParticles: [],
      shootingStars: [],
      wishActive: false,
      wishTimer: 0,
    },
    ui: {
      pickupFlash: 0,
      pickupText: "",
      pickupTextTimer: 0,
      milestoneShown: new Set(),
      milestoneText: "",
      milestoneTimer: 0,
    },
    world: {
      lastBiomeIndex: 0,
      started: false,
      finished: false,
      wasAirborne: false,
      prevJumpY: 0,
    },
  };
}
```

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 3: Commit**

```bash
git add src/app/\(public\)/story/game/game-state.ts
git commit -m "refactor(story): extract game state types and factory to game-state.ts"
```

---

### Task 2: Create `game-constants.ts` — all magic numbers

**Files:**
- Create: `src/app/(public)/story/game/game-constants.ts`

**Step 1: Create file with all extracted constants**

Move constants from `useGameLoop.ts` lines 128-131 and extract inline magic numbers throughout the update function.

```ts
// ---------------------------------------------------------------------------
// Ability constants
// ---------------------------------------------------------------------------

export const TELEPORT_DISTANCE = 200;
export const TELEPORT_COOLDOWN = 90;
export const BLAST_DURATION = 40;
export const FLOAT_GRAVITY = 0.05;
export const FLY_MAX_FALL_SPEED = 1;

// ---------------------------------------------------------------------------
// SSJ multipliers
// ---------------------------------------------------------------------------

export const SSJ_SPEED_MULT = 1.3;
export const SSJ_JUMP_MULT = 1.2;
export const DOUBLE_JUMP_MULT = 0.85;
export const SPRINT_ACCEL_MULT = 1.5;
export const CROUCH_DECEL_MULT = 3;

// ---------------------------------------------------------------------------
// Animation timing (frames)
// ---------------------------------------------------------------------------

export const ANIM_SPEED_WALK = 8;
export const ANIM_SPEED_SPRINT = 5;
export const ANIM_SPEED_IDLE = 30;

// ---------------------------------------------------------------------------
// Transformation
// ---------------------------------------------------------------------------

export const TRANSFORM_DURATION = 120;
export const SSJ_POWER_THRESHOLD = 9001;
export const MAX_POWER_LEVEL = 9001;

// ---------------------------------------------------------------------------
// Particles
// ---------------------------------------------------------------------------

export const LANDING_DUST_COUNT = 8;
export const LANDING_DUST_SPREAD = 30;
export const LANDING_IMPACT_THRESHOLD = -30;
export const MAX_SCREEN_SHAKE = 8;
export const TRANSFORM_SCREEN_SHAKE = 10;

export const FOOTSTEP_INTERVAL_SPRINT = 3;
export const FOOTSTEP_INTERVAL_WALK = 6;
export const FOOTSTEP_DUST_SPRINT = 2;
export const FOOTSTEP_DUST_WALK = 1;

export const AFTERIMAGE_INTERVAL = 4;
export const AFTERIMAGE_INITIAL_ALPHA = 0.5;
export const AFTERIMAGE_DECAY = 0.04;

export const PARTICLE_GRAVITY = 0.1;

// ---------------------------------------------------------------------------
// Decay rates (per frame)
// ---------------------------------------------------------------------------

export const DECAY_POWER_UP_FLASH = 0.03;
export const DECAY_PICKUP_FLASH = 0.02;
export const DECAY_TELEPORT_FLASH = 0.05;
export const DECAY_TRANSFORM_FLASH = 0.015;
export const DECAY_SCREEN_SHAKE = 0.3;

// ---------------------------------------------------------------------------
// Pickup values
// ---------------------------------------------------------------------------

export const SENZU_POWER_BONUS = 500;
export const KI_ORB_POWER_BONUS = 50;
export const DRAGON_BALL_POWER_BONUS = 150;
export const ENEMY_KILL_POWER_BONUS = 100;
export const BASE_POWER_SCALE = 8000;

// ---------------------------------------------------------------------------
// Pickup UI
// ---------------------------------------------------------------------------

export const PICKUP_TEXT_DRAGONBALL_DURATION = 120;
export const PICKUP_TEXT_SENZU_DURATION = 90;
export const PICKUP_TEXT_ENEMY_DURATION = 60;
export const PICKUP_FLASH_DRAGONBALL = 0.6;
export const PICKUP_FLASH_SENZU = 0.4;
export const PICKUP_FLASH_KI_ORB = 0.15;
export const PICKUP_FLASH_ENEMY = 0.2;
export const PICKUP_FLASH_DOUBLE_JUMP = 0.3;

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

export const MILESTONES: [number, string][] = [
  [1000, "Kaioken!"],
  [3000, "Kaioken x10!"],
  [5000, "Kaioken x20!"],
  [7000, "SSJ incoming...!"],
];
export const MILESTONE_DURATION = 120;
export const MILESTONE_FLASH = 0.3;
export const MILESTONE_SHAKE = 3;

// ---------------------------------------------------------------------------
// Weather
// ---------------------------------------------------------------------------

export const WEATHER_SPAWN_INTERVAL = 2;
export const WEATHER_SPAWN_COUNT_DEFAULT = 2;
export const WEATHER_SPAWN_COUNT_SPACE = 3;

// ---------------------------------------------------------------------------
// Wish screen
// ---------------------------------------------------------------------------

export const WISH_DISMISS_DELAY = 180;
export const WISH_TRANSFORM_FLASH = 0.5;

// ---------------------------------------------------------------------------
// Shooting stars
// ---------------------------------------------------------------------------

export const SHOOTING_STAR_SPAWN_CHANCE = 0.02;
export const SHOOTING_STAR_BIOME_START = 0.75;

// ---------------------------------------------------------------------------
// Player rendering
// ---------------------------------------------------------------------------

export const PLAYER_SCALE = 3;
export const SPRITE_SIZE = 32;
export const CROUCH_SQUISH = 0.6;
export const ENEMY_BEAM_HIT_TOLERANCE = 30;
export const ENEMY_DEATH_TIMER = 30;
export const COLLECTIBLE_Y_TOLERANCE = 10;

// ---------------------------------------------------------------------------
// Moving threshold
// ---------------------------------------------------------------------------

export const MOVING_THRESHOLD = 0.1;
export const CROUCH_VELOCITY_THRESHOLD = 0.5;
```

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 3: Commit**

```bash
git add src/app/\(public\)/story/game/game-constants.ts
git commit -m "refactor(story): extract game constants to game-constants.ts"
```

---

### Task 3: Split `renderer.ts` into 6 modules

**Files:**
- Create: `src/app/(public)/story/game/renderer/helpers.ts`
- Create: `src/app/(public)/story/game/renderer/layers.ts`
- Create: `src/app/(public)/story/game/renderer/decorations.ts`
- Create: `src/app/(public)/story/game/renderer/characters.ts`
- Create: `src/app/(public)/story/game/renderer/effects.ts`
- Create: `src/app/(public)/story/game/renderer/hud.ts`
- Create: `src/app/(public)/story/game/renderer/index.ts`

**Important:** The barrel `index.ts` re-exports everything so `import * as renderer from "./renderer"` in `useGameLoop.ts` still works — TypeScript resolves `./renderer` to `./renderer/index.ts`.

**Step 1: Create `renderer/helpers.ts`**

Move from `renderer.ts` lines 1-124: imports, `GROUND_Y_RATIO`, `parseHex`, `toHex`, `lerpColor`, `getBiomeAtProgress`, `interpolateBiomeColors`, `seededRandom`.

All functions exported (they're used by other renderer modules).

```ts
// src/app/(public)/story/game/renderer/helpers.ts
import { PLAYER_Y_OFFSET } from "../world-data";
import type { IStoryBiome } from "@/app/models/IStoryDictionary";

export const GROUND_Y_RATIO = PLAYER_Y_OFFSET;

export function parseHex(hex: string): [number, number, number] { /* exact copy from renderer.ts lines 25-31 */ }
export function toHex(r: number, g: number, b: number): string { /* lines 35-43 */ }
export function lerpColor(a: string, b: string, t: number): string { /* lines 46-54 */ }
export function getBiomeAtProgress(biomes: IStoryBiome[], progress: number): number { /* lines 57-65 */ }
export function interpolateBiomeColors(biomes: IStoryBiome[], progress: number) { /* lines 71-115 */ }
export function seededRandom(seed: number): number { /* lines 121-124 */ }
```

**Step 2: Create `renderer/layers.ts`**

Move: `drawSkyLayer`, `drawDayNightTint`, `drawMountainLayer`, `drawMidgroundLayer`, `drawGroundLayer`, `drawGroundSurface`, `drawForegroundLayer`, `drawParallaxFog` (lines 130-541 and 1743-1784).

Import `helpers.ts` functions, `WORLD_WIDTH`, `PARALLAX_SPEEDS` from world-data.

**Step 3: Create `renderer/decorations.ts`**

Move: `drawDecorations`, `drawTree`, `drawRock`, `drawWaterfall`, `drawBuilding`, `drawBanner`, `drawStar`, `drawKiOrb` (lines 901-1205).

Import sprite data, `PARALLAX_SPEEDS`, helpers.

**Step 4: Create `renderer/characters.ts`**

Move: `drawSprite`, `drawPlayer`, `drawEnemies`, `drawEnemySprite`, `drawAfterimages`, `ENEMY_COLORS` interface (lines 643-1665).

Import helpers for `parseHex`, `GROUND_Y_RATIO`, `PARALLAX_SPEEDS`.

**Step 5: Create `renderer/effects.ts`**

Move: `drawKamehameha`, `drawDustParticles`, `drawWeatherParticles`, `drawShootingStars`, `drawTeleportFlash`, `drawTransformFlash`, `drawPowerUpFlash`, `drawPickupFlash` (lines 216-242, 1277-1414, 1369-1396, 1247-1271, 1710-1737).

**Step 6: Create `renderer/hud.ts`**

Move: `drawScouter`, `drawDragonBallRadar`, `drawControlsHint`, `drawPickupText`, `drawMilestoneText`, `drawWishScreen`, `drawFloatingText` (lines 547-637, 823-895, 1211-1241, 1420-1542, 1522-1542, 1671-1704).

Import helpers, `WORLD_WIDTH`.

**Step 7: Create `renderer/index.ts` barrel**

```ts
export { drawSkyLayer, drawDayNightTint, drawMountainLayer, drawMidgroundLayer, drawGroundLayer, drawGroundSurface, drawForegroundLayer, drawParallaxFog } from "./layers";
export { drawDecorations } from "./decorations";
export { drawSprite, drawPlayer, drawEnemies, drawAfterimages } from "./characters";
export { drawKamehameha, drawDustParticles, drawWeatherParticles, drawShootingStars, drawTeleportFlash, drawTransformFlash, drawPowerUpFlash, drawPickupFlash } from "./effects";
export { drawScouter, drawDragonBallRadar, drawControlsHint, drawPickupText, drawMilestoneText, drawWishScreen, drawFloatingText } from "./hud";
```

**Step 8: Delete old `renderer.ts`**

```bash
rm src/app/\(public\)/story/game/renderer.ts
```

**Step 9: Verify build**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`

Fix any import issues. The `import * as renderer from "./renderer"` in `useGameLoop.ts` should resolve to `./renderer/index.ts` automatically.

**Step 10: Commit**

```bash
git add src/app/\(public\)/story/game/renderer/
git add -u src/app/\(public\)/story/game/renderer.ts
git commit -m "refactor(story): split renderer.ts into 6 focused modules"
```

---

### Task 4: Create update modules

**Files:**
- Create: `src/app/(public)/story/game/update/movement.ts`
- Create: `src/app/(public)/story/game/update/combat.ts`
- Create: `src/app/(public)/story/game/update/collectibles.ts`
- Create: `src/app/(public)/story/game/update/effects.ts`
- Create: `src/app/(public)/story/game/update/milestones.ts`

Each update function receives the `GameState` (mutates in place) plus any needed context (keys, canvas dimensions, biomes). They return `void`.

**Step 1: Create `update/movement.ts`**

Extract from `useGameLoop.ts` lines 214-303: sprint, crouch, velocity, jump, flying, gravity, landing impact (with dust spawning).

```ts
import type { GameState, InputState } from "../game-state";
import {
  SSJ_SPEED_MULT, SSJ_JUMP_MULT, DOUBLE_JUMP_MULT,
  SPRINT_ACCEL_MULT, CROUCH_DECEL_MULT, FLOAT_GRAVITY,
  FLY_MAX_FALL_SPEED, LANDING_DUST_COUNT, LANDING_DUST_SPREAD,
  LANDING_IMPACT_THRESHOLD, MAX_SCREEN_SHAKE,
  MOVING_THRESHOLD, CROUCH_VELOCITY_THRESHOLD,
} from "../game-constants";
import {
  WORLD_WIDTH, PLAYER_SPEED, SPRINT_SPEED,
  PLAYER_ACCEL, PLAYER_DECEL, PLAYER_Y_OFFSET,
  JUMP_FORCE, GRAVITY,
} from "../world-data";
import * as sound from "../sound";

export function updateMovement(
  s: GameState,
  keys: InputState,
  prevJump: { current: boolean },
  canvasW: number,
  canvasH: number,
): void {
  const mov = s.movement;

  // Sprint
  mov.isSprinting = keys.sprint && (keys.left || keys.right) && !s.world.finished;

  // Crouch
  mov.isCrouching = keys.down && mov.isGrounded && Math.abs(mov.velocity) < CROUCH_VELOCITY_THRESHOLD && !s.world.finished;

  const ssjMult = s.power.isSuperSaiyan ? SSJ_SPEED_MULT : 1;
  const maxSpeed = (mov.isSprinting ? SPRINT_SPEED : PLAYER_SPEED) * ssjMult;
  const accel = (mov.isSprinting ? PLAYER_ACCEL * SPRINT_ACCEL_MULT : PLAYER_ACCEL) * ssjMult;

  // Horizontal movement
  if (!mov.isCrouching && !s.combat.blastActive) {
    if (keys.right && !s.world.finished) {
      mov.velocity = Math.min(mov.velocity + accel, maxSpeed);
      mov.facingLeft = false;
      s.world.started = true;
    } else if (keys.left && !s.world.finished) {
      mov.velocity = Math.max(mov.velocity - accel, -maxSpeed);
      mov.facingLeft = true;
      s.world.started = true;
    } else {
      if (mov.velocity > 0) mov.velocity = Math.max(mov.velocity - PLAYER_DECEL, 0);
      if (mov.velocity < 0) mov.velocity = Math.min(mov.velocity + PLAYER_DECEL, 0);
    }
  } else if (mov.isCrouching) {
    if (mov.velocity > 0) mov.velocity = Math.max(mov.velocity - PLAYER_DECEL * CROUCH_DECEL_MULT, 0);
    if (mov.velocity < 0) mov.velocity = Math.min(mov.velocity + PLAYER_DECEL * CROUCH_DECEL_MULT, 0);
  }

  // Jump (edge detection)
  const jumpPressed = keys.jump && !prevJump.current;
  prevJump.current = keys.jump;

  if (jumpPressed && !s.world.finished && !mov.isCrouching && !s.combat.blastActive) {
    if (mov.isGrounded) {
      mov.jumpVelocity = JUMP_FORCE * (s.power.isSuperSaiyan ? SSJ_JUMP_MULT : 1);
      mov.isGrounded = false;
      mov.jumpCount = 1;
      s.world.started = true;
      sound.playJump();
    } else if (mov.jumpCount === 1) {
      mov.jumpVelocity = JUMP_FORCE * DOUBLE_JUMP_MULT * (s.power.isSuperSaiyan ? SSJ_JUMP_MULT : 1);
      mov.jumpCount = 2;
      s.ui.pickupFlash = PICKUP_FLASH_DOUBLE_JUMP;
      sound.playDoubleJump();
    }
  }

  // Flying
  mov.isFlying = keys.jump && !mov.isGrounded && mov.jumpCount >= 1 && !s.world.finished;

  // Gravity
  if (!mov.isGrounded) {
    const grav = mov.isFlying ? FLOAT_GRAVITY : GRAVITY;
    mov.jumpY += mov.jumpVelocity;
    mov.jumpVelocity += grav;
    if (mov.isFlying && mov.jumpVelocity > FLY_MAX_FALL_SPEED) {
      mov.jumpVelocity = FLY_MAX_FALL_SPEED;
    }
    if (mov.jumpY >= 0) {
      // Landing impact
      if (s.world.wasAirborne && s.world.prevJumpY < LANDING_IMPACT_THRESHOLD) {
        s.effects.screenShake = Math.min(MAX_SCREEN_SHAKE, Math.abs(s.world.prevJumpY) / 10);
        sound.playLanding();
        const groundY = canvasH * PLAYER_Y_OFFSET;
        const playerScreenX = canvasW / 2;
        for (let i = 0; i < LANDING_DUST_COUNT; i++) {
          s.effects.dustParticles.push({
            x: playerScreenX + (Math.random() - 0.5) * LANDING_DUST_SPREAD,
            y: groundY,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 2 - 0.5,
            life: 20 + Math.random() * 15,
          });
        }
      }
      mov.jumpY = 0;
      mov.jumpVelocity = 0;
      mov.isGrounded = true;
      mov.jumpCount = 0;
      mov.isFlying = false;
    }
  }

  // Track airborne state
  s.world.wasAirborne = !mov.isGrounded;
  if (!mov.isGrounded) s.world.prevJumpY = mov.jumpY;

  // Apply scroll
  mov.scrollX = Math.max(0, Math.min(mov.scrollX + mov.velocity, WORLD_WIDTH));

  // End detection
  if (mov.scrollX >= WORLD_WIDTH) {
    s.world.finished = true;
  }
}
```

Note: Import `PICKUP_FLASH_DOUBLE_JUMP` from game-constants too.

**Step 2: Create `update/combat.ts`**

Extract from `useGameLoop.ts` lines 305-521: blast, teleport, enemy patrol, kamehameha collision.

```ts
import type { GameState, InputState } from "../game-state";
import {
  TELEPORT_DISTANCE, TELEPORT_COOLDOWN, BLAST_DURATION,
  ENEMY_BEAM_HIT_TOLERANCE, ENEMY_DEATH_TIMER, ENEMY_KILL_POWER_BONUS,
  MAX_POWER_LEVEL, PICKUP_TEXT_ENEMY_DURATION, PICKUP_FLASH_ENEMY,
} from "../game-constants";
import { WORLD_WIDTH, ENEMIES } from "../world-data";
import * as sound from "../sound";

export function updateCombat(
  s: GameState,
  keys: InputState,
  prevBlast: { current: boolean },
  prevTeleport: { current: boolean },
  canvasW: number,
): void {
  const mov = s.movement;
  const combat = s.combat;

  // Kamehameha blast — edge detection
  const blastPressed = keys.blast && !prevBlast.current;
  prevBlast.current = keys.blast;

  if (blastPressed && !s.world.finished && !combat.blastActive) {
    combat.blastActive = true;
    combat.blastTimer = BLAST_DURATION;
    sound.playBlast();
  }
  if (combat.blastActive) {
    combat.blastTimer--;
    if (combat.blastTimer <= 0) {
      combat.blastActive = false;
    }
  }

  // Instant Transmission — edge detection
  const teleportPressed = keys.teleport && !prevTeleport.current;
  prevTeleport.current = keys.teleport;

  if (teleportPressed && !s.world.finished && combat.teleportCooldown <= 0) {
    const dir = mov.facingLeft ? -1 : 1;
    mov.scrollX = Math.max(0, Math.min(mov.scrollX + TELEPORT_DISTANCE * dir, WORLD_WIDTH));
    combat.teleportFlash = 1.0;
    combat.teleportCooldown = TELEPORT_COOLDOWN;
    s.world.started = true;
    sound.playTeleport();
  }
  if (combat.teleportCooldown > 0) combat.teleportCooldown--;

  // Enemy patrol + Kamehameha collision
  const playerWorldX = mov.scrollX + canvasW / 2;

  for (let i = 0; i < combat.enemies.length; i++) {
    const es = combat.enemies[i];
    const def = ENEMIES[i];

    if (!es.alive) {
      if (es.deathTimer > 0) es.deathTimer--;
      continue;
    }

    // Patrol
    es.x += def.speed * es.dir;
    if (es.x > def.x + def.range) es.dir = -1;
    if (es.x < def.x - def.range) es.dir = 1;

    // Kamehameha collision
    if (combat.blastActive) {
      const beamProgress = 1 - combat.blastTimer / BLAST_DURATION;
      const beamLen = beamProgress * canvasW * 0.8;
      const beamDir = mov.facingLeft ? -1 : 1;
      const beamEndWorldX = playerWorldX + beamDir * beamLen;

      const minX = Math.min(playerWorldX, beamEndWorldX);
      const maxX = Math.max(playerWorldX, beamEndWorldX);

      if (es.x >= minX - ENEMY_BEAM_HIT_TOLERANCE && es.x <= maxX + ENEMY_BEAM_HIT_TOLERANCE) {
        es.alive = false;
        es.deathTimer = ENEMY_DEATH_TIMER;
        combat.enemiesKilled++;
        s.power.powerLevel = Math.min(MAX_POWER_LEVEL, s.power.powerLevel + ENEMY_KILL_POWER_BONUS);
        s.ui.pickupText = `Enemy defeated! +${ENEMY_KILL_POWER_BONUS} power`;
        s.ui.pickupTextTimer = PICKUP_TEXT_ENEMY_DURATION;
        s.ui.pickupFlash = PICKUP_FLASH_ENEMY;
        sound.playEnemyDefeat();
      }
    }
  }
}
```

**Step 3: Create `update/collectibles.ts`**

Extract from `useGameLoop.ts` lines 352-408: collectible detection, power level calculation.

```ts
import type { GameState } from "../game-state";
import {
  MAX_POWER_LEVEL, SENZU_POWER_BONUS, KI_ORB_POWER_BONUS,
  DRAGON_BALL_POWER_BONUS, BASE_POWER_SCALE,
  PICKUP_TEXT_DRAGONBALL_DURATION, PICKUP_TEXT_SENZU_DURATION,
  PICKUP_FLASH_DRAGONBALL, PICKUP_FLASH_SENZU, PICKUP_FLASH_KI_ORB,
  COLLECTIBLE_Y_TOLERANCE, SPRITE_SIZE, PLAYER_SCALE,
} from "../game-constants";
import { WORLD_WIDTH, COLLECT_RADIUS, PLAYER_Y_OFFSET, DECORATIONS } from "../world-data";
import * as sound from "../sound";

export function updateCollectibles(
  s: GameState,
  canvasW: number,
  canvasH: number,
): void {
  const mov = s.movement;
  const col = s.collectibles;

  const playerWorldX = mov.scrollX + canvasW / 2;
  const spriteH = SPRITE_SIZE * PLAYER_SCALE;
  const playerFeetY = canvasH * PLAYER_Y_OFFSET + mov.jumpY;
  const playerTopY = playerFeetY - spriteH;

  for (let i = 0; i < DECORATIONS.length; i++) {
    if (col.collectedSet.has(i)) continue;
    const dec = DECORATIONS[i];
    if (dec.layer !== "ground") continue;
    if (dec.type !== "dragonball" && dec.type !== "senzu" && dec.type !== "ki_orb") continue;

    const distX = Math.abs(dec.x - playerWorldX);
    const itemY = dec.y * canvasH;
    const yOverlap = itemY >= playerTopY - COLLECTIBLE_Y_TOLERANCE && itemY <= playerFeetY + COLLECTIBLE_Y_TOLERANCE;

    if (distX < COLLECT_RADIUS && yOverlap) {
      col.collectedSet.add(i);
      if (dec.type === "dragonball" && dec.star) {
        col.collectedDragonBalls.add(dec.star);
        s.ui.pickupFlash = PICKUP_FLASH_DRAGONBALL;
        s.ui.pickupText = `Dragon Ball ${dec.star} collected! (${col.collectedDragonBalls.size}/7)`;
        s.ui.pickupTextTimer = PICKUP_TEXT_DRAGONBALL_DURATION;
        sound.playCollectDragonBall();
        if (col.collectedDragonBalls.size === 7) {
          s.effects.wishActive = true;
          s.effects.wishTimer = 0;
          sound.playWish();
        }
      } else if (dec.type === "senzu") {
        col.collectedSenzu++;
        s.ui.pickupFlash = PICKUP_FLASH_SENZU;
        s.ui.pickupText = "Senzu Bean! Power restored!";
        s.ui.pickupTextTimer = PICKUP_TEXT_SENZU_DURATION;
        s.power.powerLevel = Math.min(MAX_POWER_LEVEL, s.power.powerLevel + SENZU_POWER_BONUS);
        sound.playCollectSenzu();
      } else if (dec.type === "ki_orb") {
        col.collectedKiOrbs++;
        s.ui.pickupFlash = PICKUP_FLASH_KI_ORB;
        s.ui.pickupText = "";
        s.power.powerLevel = Math.min(MAX_POWER_LEVEL, s.power.powerLevel + KI_ORB_POWER_BONUS);
        sound.playCollectOrb();
      }
    }
  }

  // Recalculate power level
  const progress = mov.scrollX / WORLD_WIDTH;
  const basePower = Math.floor(progress * BASE_POWER_SCALE);
  const orbBonus = col.collectedKiOrbs * KI_ORB_POWER_BONUS;
  const senzuBonus = col.collectedSenzu * SENZU_POWER_BONUS;
  const dbBonus = col.collectedDragonBalls.size * DRAGON_BALL_POWER_BONUS;
  s.power.powerLevel = Math.min(MAX_POWER_LEVEL, basePower + orbBonus + senzuBonus + dbBonus);
}
```

**Step 4: Create `update/effects.ts`**

Extract from `useGameLoop.ts` lines 432-595: decay timers, dust particles, footstep dust, afterimages, weather, shooting stars.

```ts
import type { GameState, WeatherParticle } from "../game-state";
import {
  DECAY_POWER_UP_FLASH, DECAY_PICKUP_FLASH, DECAY_TELEPORT_FLASH,
  DECAY_TRANSFORM_FLASH, DECAY_SCREEN_SHAKE, PARTICLE_GRAVITY,
  FOOTSTEP_INTERVAL_SPRINT, FOOTSTEP_INTERVAL_WALK,
  FOOTSTEP_DUST_SPRINT, FOOTSTEP_DUST_WALK,
  AFTERIMAGE_INTERVAL, AFTERIMAGE_INITIAL_ALPHA, AFTERIMAGE_DECAY,
  WEATHER_SPAWN_INTERVAL, WEATHER_SPAWN_COUNT_DEFAULT, WEATHER_SPAWN_COUNT_SPACE,
  SHOOTING_STAR_SPAWN_CHANCE, SHOOTING_STAR_BIOME_START,
  MOVING_THRESHOLD,
} from "../game-constants";
import { WORLD_WIDTH, PLAYER_Y_OFFSET } from "../world-data";

export function updateEffects(
  s: GameState,
  canvasW: number,
  canvasH: number,
): void {
  const mov = s.movement;
  const anim = s.animation;
  const eff = s.effects;
  const isMoving = Math.abs(mov.velocity) > MOVING_THRESHOLD;

  // Decay flashes & timers
  if (s.power.powerUpFlash > 0) s.power.powerUpFlash = Math.max(0, s.power.powerUpFlash - DECAY_POWER_UP_FLASH);
  if (s.ui.pickupFlash > 0) s.ui.pickupFlash = Math.max(0, s.ui.pickupFlash - DECAY_PICKUP_FLASH);
  if (s.ui.pickupTextTimer > 0) s.ui.pickupTextTimer--;
  if (s.combat.teleportFlash > 0) s.combat.teleportFlash = Math.max(0, s.combat.teleportFlash - DECAY_TELEPORT_FLASH);
  if (s.power.transformTimer > 0) s.power.transformTimer--;
  if (s.power.transformFlash > 0) s.power.transformFlash = Math.max(0, s.power.transformFlash - DECAY_TRANSFORM_FLASH);
  if (eff.screenShake > 0) eff.screenShake = Math.max(0, eff.screenShake - DECAY_SCREEN_SHAKE);

  // Dust particles
  eff.dustParticles = eff.dustParticles.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += PARTICLE_GRAVITY;
    p.life--;
    return p.life > 0;
  });

  // Footstep dust
  if (mov.isGrounded && isMoving && anim.frameTick % (mov.isSprinting ? FOOTSTEP_INTERVAL_SPRINT : FOOTSTEP_INTERVAL_WALK) === 0) {
    const groundY = canvasH * PLAYER_Y_OFFSET;
    const playerScreenX = canvasW / 2;
    const count = mov.isSprinting ? FOOTSTEP_DUST_SPRINT : FOOTSTEP_DUST_WALK;
    for (let i = 0; i < count; i++) {
      eff.dustParticles.push({
        x: playerScreenX + (Math.random() - 0.5) * 15,
        y: groundY,
        vx: -mov.velocity * 0.3 + (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 1.2 - 0.3,
        life: 12 + Math.random() * 8,
      });
    }
  }

  // Afterimages
  if (mov.isSprinting && isMoving && anim.frameTick % AFTERIMAGE_INTERVAL === 0) {
    eff.afterimages.push({
      x: mov.scrollX,
      y: mov.jumpY,
      frameIndex: anim.frameIndex,
      facingLeft: mov.facingLeft,
      alpha: AFTERIMAGE_INITIAL_ALPHA,
      isSuperSaiyan: s.power.isSuperSaiyan,
    });
  }
  eff.afterimages = eff.afterimages.filter((a) => {
    a.alpha -= AFTERIMAGE_DECAY;
    return a.alpha > 0;
  });

  // Weather particles
  const progress = mov.scrollX / WORLD_WIDTH;
  const weatherBiome = progress < 0.25 ? 0 : progress < 0.5 ? 1 : progress < 0.75 ? 2 : 3;

  if (weatherBiome >= 1 && anim.frameTick % WEATHER_SPAWN_INTERVAL === 0) {
    const count = weatherBiome === 3 ? WEATHER_SPAWN_COUNT_SPACE : WEATHER_SPAWN_COUNT_DEFAULT;
    for (let i = 0; i < count; i++) {
      const type: WeatherParticle["type"] = weatherBiome === 1 ? "rain" : weatherBiome === 2 ? "leaf" : "snow";
      eff.weatherParticles.push({
        x: Math.random() * canvasW,
        y: -5,
        vx: type === "leaf" ? (Math.random() - 0.5) * 2 : (Math.random() - 0.5) * 0.5,
        vy: type === "rain" ? 6 + Math.random() * 3 : type === "snow" ? 1 + Math.random() : 1.5 + Math.random(),
        life: type === "rain" ? 60 : 120,
        size: type === "rain" ? 1 : type === "leaf" ? 3 : 2,
        type,
      });
    }
  }

  eff.weatherParticles = eff.weatherParticles.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.type === "leaf") p.vx += Math.sin(p.life * 0.1) * 0.1;
    if (p.type === "snow") p.vx += Math.sin(p.life * 0.05) * 0.05;
    p.life--;
    return p.life > 0 && p.y < canvasH;
  });

  // Shooting stars
  if (progress >= SHOOTING_STAR_BIOME_START && Math.random() < SHOOTING_STAR_SPAWN_CHANCE) {
    const life = 30 + Math.random() * 20;
    eff.shootingStars.push({
      x: Math.random() * canvasW,
      y: Math.random() * canvasH * 0.4,
      vx: -(4 + Math.random() * 6),
      vy: 3 + Math.random() * 4,
      life,
      maxLife: life,
      length: 20 + Math.random() * 30,
    });
  }
  eff.shootingStars = eff.shootingStars.filter((star) => {
    star.x += star.vx;
    star.y += star.vy;
    star.life--;
    return star.life > 0;
  });

  // Milestone timer
  if (s.ui.milestoneTimer > 0) s.ui.milestoneTimer--;
}
```

**Step 5: Create `update/milestones.ts`**

Extract from `useGameLoop.ts` lines 410-430 and 523-540: SSJ transformation, biome transitions, power milestones.

```ts
import type { GameState } from "../game-state";
import type { IStoryBiome } from "@/app/models/IStoryDictionary";
import {
  SSJ_POWER_THRESHOLD, TRANSFORM_DURATION, TRANSFORM_SCREEN_SHAKE,
  MILESTONES, MILESTONE_DURATION, MILESTONE_FLASH, MILESTONE_SHAKE,
} from "../game-constants";
import { WORLD_WIDTH } from "../world-data";
import * as sound from "../sound";

export function updateMilestones(
  s: GameState,
  biomes: IStoryBiome[],
): void {
  const progress = s.movement.scrollX / WORLD_WIDTH;

  // Super Saiyan transformation
  if (s.power.powerLevel >= SSJ_POWER_THRESHOLD && !s.power.transformTriggered) {
    s.power.transformTriggered = true;
    s.power.isSuperSaiyan = true;
    s.power.transformTimer = TRANSFORM_DURATION;
    s.power.transformFlash = 1.0;
    s.effects.screenShake = TRANSFORM_SCREEN_SHAKE;
    sound.playTransform();
  }

  // Biome transition flash
  const currentBiomeIndex = biomes.findIndex((b, i) => {
    const next = biomes[i + 1];
    return next
      ? progress >= b.startX && progress < next.startX
      : progress >= b.startX;
  });
  if (currentBiomeIndex > s.world.lastBiomeIndex) {
    s.power.powerUpFlash = 1.0;
    s.world.lastBiomeIndex = currentBiomeIndex;
  }

  // Power level milestones
  for (const [threshold, text] of MILESTONES) {
    if (s.power.powerLevel >= threshold && !s.ui.milestoneShown.has(threshold)) {
      s.ui.milestoneShown.add(threshold);
      s.ui.milestoneText = text;
      s.ui.milestoneTimer = MILESTONE_DURATION;
      s.ui.pickupFlash = MILESTONE_FLASH;
      s.effects.screenShake = MILESTONE_SHAKE;
      sound.playMilestone();
    }
  }
}
```

**Step 6: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`

**Step 7: Commit**

```bash
git add src/app/\(public\)/story/game/update/
git commit -m "refactor(story): extract update logic into 5 focused modules"
```

---

### Task 5: Rewrite `useGameLoop.ts` to use new modules

**Files:**
- Modify: `src/app/(public)/story/game/useGameLoop.ts`

**Step 1: Rewrite the file**

Replace the entire file with a slim orchestrator that calls the update modules and keeps the render function.

The key changes:
1. Import `GameState` and `createInitialState` from `game-state.ts`
2. Import update functions from `update/*`
3. Import constants from `game-constants.ts`
4. `stateRef` uses `createInitialState()`
5. `update()` calls each update module in sequence
6. `render()` stays largely the same but accesses nested state (`s.movement.scrollX` etc.)
7. Remove all inline interfaces and constants (now in their own modules)

The new `update()` function body:

```ts
const update = useCallback(() => {
  const s = stateRef.current;
  const keys = keysRef.current;
  if (!keys) return;

  // Wish screen freezes gameplay
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
  updateAnimation(s); // inline — just the 5-line frame index logic
  updateMilestones(s, biomes);
  updateEffects(s, canvasW, canvasH);
}, [keysRef, biomes, canvasRef]);
```

The animation logic is simple enough to keep inline or as a tiny helper:

```ts
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
```

The `render()` function needs all `s.property` references updated to nested paths like `s.movement.scrollX`, `s.power.isSuperSaiyan`, etc.

**Step 2: Update `StoryCanvas.tsx` — gameState ref type**

The `StartOverlay` and `EndOverlay` access `gameState.current?.started` and `gameState.current?.finished`. Update to `gameState.current?.world.started` and `gameState.current?.world.finished`.

**Step 3: Verify build**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`

**Step 4: Commit**

```bash
git add src/app/\(public\)/story/game/useGameLoop.ts
git add src/app/\(public\)/story/components/StoryCanvas.tsx
git commit -m "refactor(story): rewrite useGameLoop to use modular update system"
```

---

### Task 6: Add error handling to `StoryCanvas.tsx`

**Files:**
- Modify: `src/app/(public)/story/components/StoryCanvas.tsx`

**Step 1: Add canvas error state and fallback**

Add a state for canvas errors and wrap the canvas setup in a try-catch. Show a user-friendly message if canvas is unavailable.

```tsx
const [canvasError, setCanvasError] = useState(false);

// In the canvas resize effect:
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setCanvasError(true);
      return;
    }
  } catch {
    setCanvasError(true);
    return;
  }
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);
  return () => window.removeEventListener("resize", resize);
}, [isDesktop]);

// In the render:
if (canvasError) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#0A0A0F] flex items-center justify-center">
      <div className="text-center">
        <p className="text-[1.25vw] text-[#FFD700] mb-[0.833vw]" style={{ fontFamily: "monospace" }}>
          Canvas not supported
        </p>
        <button
          onClick={() => router.push("/")}
          className="btn-gradient text-[0.729vw] font-semibold text-white px-[1.667vw] py-[0.625vw] rounded-[0.521vw] cursor-pointer"
        >
          Back to Portfolio
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 3: Commit**

```bash
git add src/app/\(public\)/story/components/StoryCanvas.tsx
git commit -m "refactor(story): add canvas error handling with fallback UI"
```

---

### Task 7: Final cleanup and verification

**Step 1: Delete old renderer.ts** (if not already deleted in Task 3)

```bash
rm src/app/\(public\)/story/game/renderer.ts 2>/dev/null || true
```

**Step 2: Full build verification**

Run: `npm run build 2>&1 | tail -20`

Expect clean build with no errors.

**Step 3: Final commit (if any cleanup needed)**

```bash
git add -A
git commit -m "refactor(story): complete game engine modularization"
```

---

## Dependency Order

```
Task 1 (game-state.ts) ──┐
Task 2 (game-constants.ts) ──┤── independent, can run in parallel
Task 3 (renderer/ split) ──┘
         │
Task 4 (update/ modules) ── depends on Tasks 1 + 2
         │
Task 5 (rewrite useGameLoop) ── depends on Tasks 1-4
         │
Task 6 (error handling) ── depends on Task 5
         │
Task 7 (cleanup + verify) ── depends on all
```

Tasks 1, 2, and 3 are independent and can be done in parallel.

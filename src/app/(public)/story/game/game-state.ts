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
// Nested game state sub-interfaces
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

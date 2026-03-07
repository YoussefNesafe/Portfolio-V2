export const WORLD_WIDTH = 30000; // total world width in pixels
export const PLAYER_SPEED = 4.0; // pixels per frame at full velocity
export const SPRINT_SPEED = 7.0; // pixels per frame when sprinting
export const PLAYER_ACCEL = 0.2; // acceleration per frame
export const PLAYER_DECEL = 0.1; // deceleration (friction) per frame
export const JUMP_FORCE = -7; // initial upward velocity
export const GRAVITY = 0.35; // gravity pull per frame
export const PLAYER_Y_OFFSET = 0.80; // player vertical position (% of canvas height)
export const COLLECT_RADIUS = 60; // pixel radius for collectible pickup

export const PARALLAX_SPEEDS = {
  sky: 0.1,
  mountains: 0.3,
  midground: 0.6,
  ground: 1.0,
  foreground: 1.2,
} as const;

export type ParallaxLayer = keyof typeof PARALLAX_SPEEDS;

export interface Decoration {
  type: "senzu" | "dragonball" | "nimbus" | "tree" | "rock" | "waterfall" | "building" | "banner" | "star" | "ki_orb";
  x: number; // world x position in pixels
  y: number; // 0-1 normalized vertical position in its layer
  layer: ParallaxLayer;
  star?: number; // for dragonball: 1-7 star count
}

export const DECORATIONS: Decoration[] = [
  // Biome 1: Origin — Training Grounds (0-7500)
  { type: "ki_orb", x: 300, y: 0.7, layer: "ground" },
  { type: "senzu", x: 500, y: 0.6, layer: "ground" },
  { type: "ki_orb", x: 900, y: 0.7, layer: "ground" },
  { type: "rock", x: 1200, y: 0.5, layer: "midground" },
  { type: "ki_orb", x: 1500, y: 0.7, layer: "ground" },
  { type: "tree", x: 2000, y: 0.5, layer: "midground" },
  { type: "ki_orb", x: 2500, y: 0.7, layer: "ground" },
  { type: "waterfall", x: 3000, y: 0.2, layer: "mountains" },
  { type: "ki_orb", x: 3500, y: 0.7, layer: "ground" },
  { type: "tree", x: 4500, y: 0.5, layer: "midground" },
  { type: "ki_orb", x: 5000, y: 0.7, layer: "ground" },
  { type: "rock", x: 5500, y: 0.6, layer: "ground" },
  { type: "ki_orb", x: 6000, y: 0.7, layer: "ground" },
  { type: "dragonball", x: 6500, y: 0.7, layer: "ground", star: 1 },

  // Biome 2: Arsenal — Tech Dojo (7500-15000)
  { type: "ki_orb", x: 7800, y: 0.7, layer: "ground" },
  { type: "senzu", x: 8000, y: 0.6, layer: "ground" },
  { type: "building", x: 8500, y: 0.4, layer: "midground" },
  { type: "ki_orb", x: 9200, y: 0.7, layer: "ground" },
  { type: "nimbus", x: 10000, y: 0.2, layer: "sky" },
  { type: "ki_orb", x: 10500, y: 0.7, layer: "ground" },
  { type: "building", x: 11500, y: 0.4, layer: "midground" },
  { type: "ki_orb", x: 12000, y: 0.7, layer: "ground" },
  { type: "dragonball", x: 12500, y: 0.7, layer: "ground", star: 2 },
  { type: "ki_orb", x: 13000, y: 0.7, layer: "ground" },
  { type: "dragonball", x: 13500, y: 0.7, layer: "ground", star: 3 },

  // Biome 3: Works — Tournament Arena (15000-22500)
  { type: "ki_orb", x: 15500, y: 0.7, layer: "ground" },
  { type: "senzu", x: 15800, y: 0.6, layer: "ground" },
  { type: "banner", x: 16000, y: 0.3, layer: "midground" },
  { type: "ki_orb", x: 16800, y: 0.7, layer: "ground" },
  { type: "dragonball", x: 17500, y: 0.7, layer: "ground", star: 4 },
  { type: "ki_orb", x: 18000, y: 0.7, layer: "ground" },
  { type: "banner", x: 18500, y: 0.3, layer: "midground" },
  { type: "ki_orb", x: 19200, y: 0.7, layer: "ground" },
  { type: "dragonball", x: 20000, y: 0.7, layer: "ground", star: 5 },
  { type: "ki_orb", x: 21000, y: 0.7, layer: "ground" },

  // Biome 4: Vision — Space (22500-30000)
  { type: "ki_orb", x: 23000, y: 0.7, layer: "ground" },
  { type: "star", x: 23500, y: 0.1, layer: "sky" },
  { type: "senzu", x: 24000, y: 0.6, layer: "ground" },
  { type: "ki_orb", x: 24500, y: 0.7, layer: "ground" },
  { type: "star", x: 25000, y: 0.2, layer: "sky" },
  { type: "dragonball", x: 25500, y: 0.7, layer: "ground", star: 6 },
  { type: "star", x: 26500, y: 0.05, layer: "sky" },
  { type: "ki_orb", x: 26800, y: 0.7, layer: "ground" },
  { type: "dragonball", x: 27500, y: 0.7, layer: "ground", star: 7 },
  { type: "ki_orb", x: 28500, y: 0.7, layer: "ground" },
  { type: "senzu", x: 29000, y: 0.6, layer: "ground" },
];

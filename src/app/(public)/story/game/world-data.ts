export const WORLD_WIDTH = 30000; // total world width in pixels
export const PLAYER_SPEED = 1.8; // pixels per frame at full velocity
export const PLAYER_ACCEL = 0.08; // acceleration per frame
export const PLAYER_DECEL = 0.05; // deceleration (friction) per frame
export const JUMP_FORCE = -7; // initial upward velocity
export const GRAVITY = 0.35; // gravity pull per frame
export const PLAYER_Y_OFFSET = 0.80; // player vertical position (% of canvas height)

export const PARALLAX_SPEEDS = {
  sky: 0.1,
  mountains: 0.3,
  midground: 0.6,
  ground: 1.0,
  foreground: 1.2,
} as const;

export type ParallaxLayer = keyof typeof PARALLAX_SPEEDS;

export interface Decoration {
  type: "senzu" | "dragonball" | "nimbus" | "tree" | "rock" | "waterfall" | "building" | "banner" | "star";
  x: number; // world x position in pixels
  y: number; // 0-1 normalized vertical position in its layer
  layer: ParallaxLayer;
  star?: number; // for dragonball: 1-7 star count
}

export const DECORATIONS: Decoration[] = [
  // Biome 1: Origin — Training Grounds (0-7500)
  { type: "senzu", x: 500, y: 0.6, layer: "ground" },
  { type: "rock", x: 1200, y: 0.5, layer: "midground" },
  { type: "tree", x: 2000, y: 0.5, layer: "midground" },
  { type: "waterfall", x: 3000, y: 0.2, layer: "mountains" },
  { type: "tree", x: 4500, y: 0.5, layer: "midground" },
  { type: "rock", x: 5500, y: 0.6, layer: "ground" },
  { type: "dragonball", x: 6500, y: 0.15, layer: "sky", star: 1 },

  // Biome 2: Arsenal — Tech Dojo (7500-15000)
  { type: "building", x: 8500, y: 0.4, layer: "midground" },
  { type: "nimbus", x: 10000, y: 0.2, layer: "sky" },
  { type: "building", x: 11500, y: 0.4, layer: "midground" },
  { type: "dragonball", x: 12500, y: 0.1, layer: "sky", star: 2 },
  { type: "dragonball", x: 13500, y: 0.2, layer: "sky", star: 3 },

  // Biome 3: Works — Tournament Arena (15000-22500)
  { type: "banner", x: 16000, y: 0.3, layer: "midground" },
  { type: "banner", x: 18500, y: 0.3, layer: "midground" },
  { type: "dragonball", x: 17500, y: 0.15, layer: "sky", star: 4 },
  { type: "dragonball", x: 20000, y: 0.1, layer: "sky", star: 5 },

  // Biome 4: Vision — Space (22500-30000)
  { type: "star", x: 23500, y: 0.1, layer: "sky" },
  { type: "star", x: 25000, y: 0.2, layer: "sky" },
  { type: "star", x: 26500, y: 0.05, layer: "sky" },
  { type: "dragonball", x: 25500, y: 0.15, layer: "sky", star: 6 },
  { type: "dragonball", x: 27500, y: 0.1, layer: "sky", star: 7 },
  { type: "senzu", x: 29000, y: 0.6, layer: "ground" },
];

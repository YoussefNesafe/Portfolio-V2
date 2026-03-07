export const WORLD_WIDTH = 12000; // total world width in pixels
export const PLAYER_SPEED = 3; // pixels per frame at full velocity
export const PLAYER_ACCEL = 0.15; // acceleration per frame
export const PLAYER_DECEL = 0.08; // deceleration (friction) per frame
export const PLAYER_Y_OFFSET = 0.72; // player vertical position (% of canvas height)

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
  // Biome 1: Origin — Training Grounds
  { type: "senzu", x: 200, y: 0.6, layer: "ground" },
  { type: "rock", x: 500, y: 0.5, layer: "midground" },
  { type: "tree", x: 800, y: 0.5, layer: "midground" },
  { type: "waterfall", x: 1200, y: 0.2, layer: "mountains" },
  { type: "tree", x: 1800, y: 0.5, layer: "midground" },
  { type: "rock", x: 2200, y: 0.6, layer: "ground" },
  { type: "dragonball", x: 2500, y: 0.15, layer: "sky", star: 1 },

  // Biome 2: Arsenal — Tech Dojo
  { type: "building", x: 3500, y: 0.4, layer: "midground" },
  { type: "nimbus", x: 4000, y: 0.2, layer: "sky" },
  { type: "building", x: 4500, y: 0.4, layer: "midground" },
  { type: "dragonball", x: 5000, y: 0.1, layer: "sky", star: 2 },
  { type: "dragonball", x: 5500, y: 0.2, layer: "sky", star: 3 },

  // Biome 3: Works — Tournament Arena
  { type: "banner", x: 6500, y: 0.3, layer: "midground" },
  { type: "banner", x: 7500, y: 0.3, layer: "midground" },
  { type: "dragonball", x: 7000, y: 0.15, layer: "sky", star: 4 },
  { type: "dragonball", x: 8000, y: 0.1, layer: "sky", star: 5 },

  // Biome 4: Vision — Space
  { type: "star", x: 9500, y: 0.1, layer: "sky" },
  { type: "star", x: 10000, y: 0.2, layer: "sky" },
  { type: "star", x: 10500, y: 0.05, layer: "sky" },
  { type: "dragonball", x: 10200, y: 0.15, layer: "sky", star: 6 },
  { type: "dragonball", x: 11000, y: 0.1, layer: "sky", star: 7 },
  { type: "senzu", x: 11500, y: 0.6, layer: "ground" },
];

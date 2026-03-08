/**
 * Shared helper functions for the renderer modules.
 */

import { WORLD_WIDTH, PLAYER_Y_OFFSET } from "../world-data";
import type { IStoryBiome } from "@/app/models/IStoryDictionary";

/** Vertical position of the ground surface as a fraction of canvas height. */
export const GROUND_Y_RATIO = PLAYER_Y_OFFSET;

/** Parse a hex color string (#RRGGBB) into [r, g, b]. */
export function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

/** Convert [r, g, b] back to a hex string. */
export function toHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    "#" +
    clamp(r).toString(16).padStart(2, "0") +
    clamp(g).toString(16).padStart(2, "0") +
    clamp(b).toString(16).padStart(2, "0")
  );
}

/** Linearly interpolate between two hex colors. t in [0,1]. */
export function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  return toHex(
    ar + (br - ar) * t,
    ag + (bg - ag) * t,
    ab + (bb - ab) * t,
  );
}

/** Return the index of the biome the player is currently in. */
export function getBiomeAtProgress(
  biomes: IStoryBiome[],
  progress: number,
): number {
  for (let i = biomes.length - 1; i >= 0; i--) {
    if (progress >= biomes[i].startX) return i;
  }
  return 0;
}

/**
 * Get the current biome colors with interpolation toward the next biome
 * near biome boundaries.
 */
export function interpolateBiomeColors(
  biomes: IStoryBiome[],
  progress: number,
): {
  skyTop: string;
  skyBottom: string;
  groundColor: string;
  mountainColor: string;
} {
  const idx = getBiomeAtProgress(biomes, progress);
  const biome = biomes[idx];

  if (idx >= biomes.length - 1) {
    return {
      skyTop: biome.skyGradient[0],
      skyBottom: biome.skyGradient[1],
      groundColor: biome.groundColor,
      mountainColor: biome.mountainColor,
    };
  }

  const next = biomes[idx + 1];
  const biomeStart = biome.startX;
  const biomeEnd = next.startX;
  const biomeLen = biomeEnd - biomeStart;

  // Start blending in the last 20% of the biome
  const blendStart = biomeEnd - biomeLen * 0.2;
  if (progress < blendStart) {
    return {
      skyTop: biome.skyGradient[0],
      skyBottom: biome.skyGradient[1],
      groundColor: biome.groundColor,
      mountainColor: biome.mountainColor,
    };
  }

  const t = (progress - blendStart) / (biomeEnd - blendStart);
  return {
    skyTop: lerpColor(biome.skyGradient[0], next.skyGradient[0], t),
    skyBottom: lerpColor(biome.skyGradient[1], next.skyGradient[1], t),
    groundColor: lerpColor(biome.groundColor, next.groundColor, t),
    mountainColor: lerpColor(biome.mountainColor, next.mountainColor, t),
  };
}

// ---------------------------------------------------------------------------
// Seeded pseudo-random for deterministic positioning
// ---------------------------------------------------------------------------

export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

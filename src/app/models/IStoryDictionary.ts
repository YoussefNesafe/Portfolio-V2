export interface IStoryTextItem {
  text: string;
  x: number; // world x-position (0-1 normalized, where 0=start, 1=end)
  glow?: boolean; // ki energy glow effect on text
  size?: "normal" | "large"; // large = chapter titles
}

export interface IStoryBiome {
  id: string;
  title: string;
  startX: number; // 0-1 normalized position where biome begins
  skyGradient: [string, string]; // top, bottom colors
  groundColor: string;
  mountainColor: string;
  texts: IStoryTextItem[];
}

export interface IStoryDictionary {
  title: string;
  startPrompt: string; // "Press → to begin"
  endMessage: string[]; // final screen text lines
  biomes: IStoryBiome[];
}

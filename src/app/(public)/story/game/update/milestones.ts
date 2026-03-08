import type { GameState } from "../game-state";
import type { IStoryBiome } from "@/app/models/IStoryDictionary";
import {
  SSJ_POWER_THRESHOLD,
  TRANSFORM_DURATION,
  TRANSFORM_SCREEN_SHAKE,
  MILESTONES,
  MILESTONE_DURATION,
  MILESTONE_FLASH,
  MILESTONE_SHAKE,
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

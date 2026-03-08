import type { GameState } from "../game-state";
import {
  MAX_POWER_LEVEL,
  SENZU_POWER_BONUS,
  KI_ORB_POWER_BONUS,
  DRAGON_BALL_POWER_BONUS,
  BASE_POWER_SCALE,
  PICKUP_TEXT_DRAGONBALL_DURATION,
  PICKUP_TEXT_SENZU_DURATION,
  PICKUP_FLASH_DRAGONBALL,
  PICKUP_FLASH_SENZU,
  PICKUP_FLASH_KI_ORB,
  COLLECTIBLE_Y_TOLERANCE,
  SPRITE_SIZE,
  PLAYER_SCALE,
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
        // Check for wish
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

  // Recalculate power level from progress + bonuses
  const progress = mov.scrollX / WORLD_WIDTH;
  const basePower = Math.floor(progress * BASE_POWER_SCALE);
  const orbBonus = col.collectedKiOrbs * KI_ORB_POWER_BONUS;
  const senzuBonus = col.collectedSenzu * SENZU_POWER_BONUS;
  const dbBonus = col.collectedDragonBalls.size * DRAGON_BALL_POWER_BONUS;
  s.power.powerLevel = Math.min(MAX_POWER_LEVEL, basePower + orbBonus + senzuBonus + dbBonus);
}

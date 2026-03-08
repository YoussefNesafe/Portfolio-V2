import type { GameState, InputState } from "../game-state";
import {
  TELEPORT_DISTANCE,
  TELEPORT_COOLDOWN,
  BLAST_DURATION,
  ENEMY_BEAM_HIT_TOLERANCE,
  ENEMY_DEATH_TIMER,
  ENEMY_KILL_POWER_BONUS,
  MAX_POWER_LEVEL,
  PICKUP_TEXT_ENEMY_DURATION,
  PICKUP_FLASH_ENEMY,
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

    // Death animation countdown
    if (!es.alive) {
      if (es.deathTimer > 0) es.deathTimer--;
      continue;
    }

    // Patrol movement
    es.x += def.speed * es.dir;
    if (es.x > def.x + def.range) es.dir = -1;
    if (es.x < def.x - def.range) es.dir = 1;

    // Check Kamehameha collision
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

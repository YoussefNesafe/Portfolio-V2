import type { GameState, WeatherParticle } from "../game-state";
import {
  DECAY_POWER_UP_FLASH,
  DECAY_PICKUP_FLASH,
  DECAY_TELEPORT_FLASH,
  DECAY_TRANSFORM_FLASH,
  DECAY_SCREEN_SHAKE,
  PARTICLE_GRAVITY,
  FOOTSTEP_INTERVAL_SPRINT,
  FOOTSTEP_INTERVAL_WALK,
  FOOTSTEP_DUST_SPRINT,
  FOOTSTEP_DUST_WALK,
  AFTERIMAGE_INTERVAL,
  AFTERIMAGE_INITIAL_ALPHA,
  AFTERIMAGE_DECAY,
  WEATHER_SPAWN_INTERVAL,
  WEATHER_SPAWN_COUNT_DEFAULT,
  WEATHER_SPAWN_COUNT_SPACE,
  SHOOTING_STAR_SPAWN_CHANCE,
  SHOOTING_STAR_BIOME_START,
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

  // Update dust particles
  eff.dustParticles = eff.dustParticles.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += PARTICLE_GRAVITY;
    p.life--;
    return p.life > 0;
  });

  // Footstep dust — spawn small particles when walking/sprinting on ground
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

  // Sprint afterimages — spawn ghost copy every N frames
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
  // Decay afterimages
  eff.afterimages = eff.afterimages.filter((a) => {
    a.alpha -= AFTERIMAGE_DECAY;
    return a.alpha > 0;
  });

  // Weather particles — biome-specific
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

  // Update weather particles
  eff.weatherParticles = eff.weatherParticles.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.type === "leaf") {
      p.vx += Math.sin(p.life * 0.1) * 0.1;
    }
    if (p.type === "snow") {
      p.vx += Math.sin(p.life * 0.05) * 0.05;
    }
    p.life--;
    return p.life > 0 && p.y < canvasH;
  });

  // Shooting stars — biome 4 only
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

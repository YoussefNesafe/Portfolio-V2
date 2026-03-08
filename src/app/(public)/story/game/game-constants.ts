// ---------------------------------------------------------------------------
// Ability constants
// ---------------------------------------------------------------------------

export const TELEPORT_DISTANCE = 200;
export const TELEPORT_COOLDOWN = 90;
export const BLAST_DURATION = 40;
export const FLOAT_GRAVITY = 0.05;
export const FLY_MAX_FALL_SPEED = 1;

// ---------------------------------------------------------------------------
// SSJ multipliers
// ---------------------------------------------------------------------------

export const SSJ_SPEED_MULT = 1.3;
export const SSJ_JUMP_MULT = 1.2;
export const DOUBLE_JUMP_MULT = 0.85;
export const SPRINT_ACCEL_MULT = 1.5;
export const CROUCH_DECEL_MULT = 3;

// ---------------------------------------------------------------------------
// Animation timing (frames)
// ---------------------------------------------------------------------------

export const ANIM_SPEED_WALK = 8;
export const ANIM_SPEED_SPRINT = 5;
export const ANIM_SPEED_IDLE = 30;

// ---------------------------------------------------------------------------
// Transformation
// ---------------------------------------------------------------------------

export const TRANSFORM_DURATION = 120;
export const SSJ_POWER_THRESHOLD = 9001;
export const MAX_POWER_LEVEL = 9001;

// ---------------------------------------------------------------------------
// Particles
// ---------------------------------------------------------------------------

export const LANDING_DUST_COUNT = 8;
export const LANDING_DUST_SPREAD = 30;
export const LANDING_IMPACT_THRESHOLD = -30;
export const MAX_SCREEN_SHAKE = 8;
export const TRANSFORM_SCREEN_SHAKE = 10;

export const FOOTSTEP_INTERVAL_SPRINT = 3;
export const FOOTSTEP_INTERVAL_WALK = 6;
export const FOOTSTEP_DUST_SPRINT = 2;
export const FOOTSTEP_DUST_WALK = 1;

export const AFTERIMAGE_INTERVAL = 4;
export const AFTERIMAGE_INITIAL_ALPHA = 0.5;
export const AFTERIMAGE_DECAY = 0.04;

export const PARTICLE_GRAVITY = 0.1;

// ---------------------------------------------------------------------------
// Decay rates (per frame)
// ---------------------------------------------------------------------------

export const DECAY_POWER_UP_FLASH = 0.03;
export const DECAY_PICKUP_FLASH = 0.02;
export const DECAY_TELEPORT_FLASH = 0.05;
export const DECAY_TRANSFORM_FLASH = 0.015;
export const DECAY_SCREEN_SHAKE = 0.3;

// ---------------------------------------------------------------------------
// Pickup values
// ---------------------------------------------------------------------------

export const SENZU_POWER_BONUS = 500;
export const KI_ORB_POWER_BONUS = 50;
export const DRAGON_BALL_POWER_BONUS = 150;
export const ENEMY_KILL_POWER_BONUS = 100;
export const BASE_POWER_SCALE = 8000;

// ---------------------------------------------------------------------------
// Pickup UI
// ---------------------------------------------------------------------------

export const PICKUP_TEXT_DRAGONBALL_DURATION = 120;
export const PICKUP_TEXT_SENZU_DURATION = 90;
export const PICKUP_TEXT_ENEMY_DURATION = 60;
export const PICKUP_FLASH_DRAGONBALL = 0.6;
export const PICKUP_FLASH_SENZU = 0.4;
export const PICKUP_FLASH_KI_ORB = 0.15;
export const PICKUP_FLASH_ENEMY = 0.2;
export const PICKUP_FLASH_DOUBLE_JUMP = 0.3;

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

export const MILESTONES: [number, string][] = [
  [1000, "Kaioken!"],
  [3000, "Kaioken x10!"],
  [5000, "Kaioken x20!"],
  [7000, "SSJ incoming...!"],
];
export const MILESTONE_DURATION = 120;
export const MILESTONE_FLASH = 0.3;
export const MILESTONE_SHAKE = 3;

// ---------------------------------------------------------------------------
// Weather
// ---------------------------------------------------------------------------

export const WEATHER_SPAWN_INTERVAL = 2;
export const WEATHER_SPAWN_COUNT_DEFAULT = 2;
export const WEATHER_SPAWN_COUNT_SPACE = 3;

// ---------------------------------------------------------------------------
// Wish screen
// ---------------------------------------------------------------------------

export const WISH_DISMISS_DELAY = 180;
export const WISH_TRANSFORM_FLASH = 0.5;

// ---------------------------------------------------------------------------
// Shooting stars
// ---------------------------------------------------------------------------

export const SHOOTING_STAR_SPAWN_CHANCE = 0.02;
export const SHOOTING_STAR_BIOME_START = 0.75;

// ---------------------------------------------------------------------------
// Player rendering
// ---------------------------------------------------------------------------

export const PLAYER_SCALE = 3;
export const SPRITE_SIZE = 32;
export const CROUCH_SQUISH = 0.6;
export const ENEMY_BEAM_HIT_TOLERANCE = 30;
export const ENEMY_DEATH_TIMER = 30;
export const COLLECTIBLE_Y_TOLERANCE = 10;

// ---------------------------------------------------------------------------
// Moving threshold
// ---------------------------------------------------------------------------

export const MOVING_THRESHOLD = 0.1;
export const CROUCH_VELOCITY_THRESHOLD = 0.5;

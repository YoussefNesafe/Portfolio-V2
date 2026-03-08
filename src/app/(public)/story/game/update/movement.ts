import type { GameState, InputState } from "../game-state";
import {
  SSJ_SPEED_MULT,
  SSJ_JUMP_MULT,
  DOUBLE_JUMP_MULT,
  SPRINT_ACCEL_MULT,
  CROUCH_DECEL_MULT,
  FLOAT_GRAVITY,
  FLY_MAX_FALL_SPEED,
  LANDING_DUST_COUNT,
  LANDING_DUST_SPREAD,
  LANDING_IMPACT_THRESHOLD,
  MAX_SCREEN_SHAKE,
  CROUCH_VELOCITY_THRESHOLD,
  PICKUP_FLASH_DOUBLE_JUMP,
} from "../game-constants";
import {
  WORLD_WIDTH,
  PLAYER_SPEED,
  SPRINT_SPEED,
  PLAYER_ACCEL,
  PLAYER_DECEL,
  PLAYER_Y_OFFSET,
  JUMP_FORCE,
  GRAVITY,
} from "../world-data";
import * as sound from "../sound";

export function updateMovement(
  s: GameState,
  keys: InputState,
  prevJump: { current: boolean },
  canvasW: number,
  canvasH: number,
): void {
  const mov = s.movement;

  // Sprint
  mov.isSprinting = keys.sprint && (keys.left || keys.right) && !s.world.finished;

  // Crouch
  mov.isCrouching = keys.down && mov.isGrounded && Math.abs(mov.velocity) < CROUCH_VELOCITY_THRESHOLD && !s.world.finished;

  const ssjMult = s.power.isSuperSaiyan ? SSJ_SPEED_MULT : 1;
  const maxSpeed = (mov.isSprinting ? SPRINT_SPEED : PLAYER_SPEED) * ssjMult;
  const accel = (mov.isSprinting ? PLAYER_ACCEL * SPRINT_ACCEL_MULT : PLAYER_ACCEL) * ssjMult;

  // Horizontal movement
  if (!mov.isCrouching && !s.combat.blastActive) {
    if (keys.right && !s.world.finished) {
      mov.velocity = Math.min(mov.velocity + accel, maxSpeed);
      mov.facingLeft = false;
      s.world.started = true;
    } else if (keys.left && !s.world.finished) {
      mov.velocity = Math.max(mov.velocity - accel, -maxSpeed);
      mov.facingLeft = true;
      s.world.started = true;
    } else {
      if (mov.velocity > 0) mov.velocity = Math.max(mov.velocity - PLAYER_DECEL, 0);
      if (mov.velocity < 0) mov.velocity = Math.min(mov.velocity + PLAYER_DECEL, 0);
    }
  } else if (mov.isCrouching) {
    if (mov.velocity > 0) mov.velocity = Math.max(mov.velocity - PLAYER_DECEL * CROUCH_DECEL_MULT, 0);
    if (mov.velocity < 0) mov.velocity = Math.min(mov.velocity + PLAYER_DECEL * CROUCH_DECEL_MULT, 0);
  }

  // Jump (edge detection)
  const jumpPressed = keys.jump && !prevJump.current;
  prevJump.current = keys.jump;

  if (jumpPressed && !s.world.finished && !mov.isCrouching && !s.combat.blastActive) {
    if (mov.isGrounded) {
      mov.jumpVelocity = JUMP_FORCE * (s.power.isSuperSaiyan ? SSJ_JUMP_MULT : 1);
      mov.isGrounded = false;
      mov.jumpCount = 1;
      s.world.started = true;
      sound.playJump();
    } else if (mov.jumpCount === 1) {
      mov.jumpVelocity = JUMP_FORCE * DOUBLE_JUMP_MULT * (s.power.isSuperSaiyan ? SSJ_JUMP_MULT : 1);
      mov.jumpCount = 2;
      s.ui.pickupFlash = PICKUP_FLASH_DOUBLE_JUMP;
      sound.playDoubleJump();
    }
  }

  // Flying — hold space while airborne to glide
  mov.isFlying = keys.jump && !mov.isGrounded && mov.jumpCount >= 1 && !s.world.finished;

  // Apply gravity (reduced when flying)
  if (!mov.isGrounded) {
    const grav = mov.isFlying ? FLOAT_GRAVITY : GRAVITY;
    mov.jumpY += mov.jumpVelocity;
    mov.jumpVelocity += grav;
    // Cap fall speed when flying
    if (mov.isFlying && mov.jumpVelocity > FLY_MAX_FALL_SPEED) {
      mov.jumpVelocity = FLY_MAX_FALL_SPEED;
    }
    if (mov.jumpY >= 0) {
      // Landing impact — check how far we fell
      if (s.world.wasAirborne && s.world.prevJumpY < LANDING_IMPACT_THRESHOLD) {
        s.effects.screenShake = Math.min(MAX_SCREEN_SHAKE, Math.abs(s.world.prevJumpY) / 10);
        sound.playLanding();
        // Spawn dust particles
        const groundY = canvasH * PLAYER_Y_OFFSET;
        const playerScreenX = canvasW / 2;
        for (let i = 0; i < LANDING_DUST_COUNT; i++) {
          s.effects.dustParticles.push({
            x: playerScreenX + (Math.random() - 0.5) * LANDING_DUST_SPREAD,
            y: groundY,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 2 - 0.5,
            life: 20 + Math.random() * 15,
          });
        }
      }
      mov.jumpY = 0;
      mov.jumpVelocity = 0;
      mov.isGrounded = true;
      mov.jumpCount = 0;
      mov.isFlying = false;
    }
  }

  // Track airborne state for landing detection
  s.world.wasAirborne = !mov.isGrounded;
  if (!mov.isGrounded) s.world.prevJumpY = mov.jumpY;

  // Apply scroll
  mov.scrollX = Math.max(0, Math.min(mov.scrollX + mov.velocity, WORLD_WIDTH));

  // End detection
  if (mov.scrollX >= WORLD_WIDTH) {
    s.world.finished = true;
  }
}

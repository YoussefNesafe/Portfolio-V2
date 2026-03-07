/**
 * Retro 8-bit sound effects using Web Audio API.
 * All sounds are procedurally generated — no audio files needed.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "square",
  volume: number = 0.1,
  freqEnd?: number,
) {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (freqEnd !== undefined) {
    osc.frequency.linearRampToValueAtTime(freqEnd, ctx.currentTime + duration);
  }
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function playJump() {
  playTone(200, 0.15, "square", 0.08, 400);
}

export function playDoubleJump() {
  playTone(400, 0.12, "square", 0.08, 700);
}

export function playCollectOrb() {
  playTone(800, 0.08, "sine", 0.06);
}

export function playCollectDragonBall() {
  const ctx = getCtx();
  if (!ctx) return;
  // Rising arpeggio
  [523, 659, 784, 1047].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.15, "sine", 0.1), i * 60);
  });
}

export function playCollectSenzu() {
  playTone(440, 0.2, "sine", 0.08, 880);
  setTimeout(() => playTone(660, 0.15, "sine", 0.08), 100);
}

export function playBlast() {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.5);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.setValueAtTime(0.12, ctx.currentTime + 0.35);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.5);

  // High frequency layer
  playTone(600, 0.4, "sine", 0.05, 200);
}

export function playTeleport() {
  playTone(1200, 0.1, "sine", 0.08, 200);
  setTimeout(() => playTone(200, 0.1, "sine", 0.08, 1200), 80);
}

export function playTransform() {
  const ctx = getCtx();
  if (!ctx) return;
  // Dramatic rising power-up
  [200, 300, 400, 500, 600, 800, 1000, 1200].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, "square", 0.06 + i * 0.01), i * 80);
  });
}

export function playLanding() {
  playTone(80, 0.15, "triangle", 0.1, 40);
}

export function playEnemyDefeat() {
  playTone(300, 0.08, "square", 0.08, 100);
  setTimeout(() => playTone(150, 0.12, "square", 0.06, 60), 60);
}

export function playMilestone() {
  playTone(523, 0.12, "sine", 0.1);
  setTimeout(() => playTone(659, 0.12, "sine", 0.1), 80);
  setTimeout(() => playTone(784, 0.2, "sine", 0.12), 160);
}

export function playWish() {
  const ctx = getCtx();
  if (!ctx) return;
  // Magical ascending sequence
  [262, 330, 392, 523, 659, 784, 1047].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.4, "sine", 0.08), i * 150);
  });
}

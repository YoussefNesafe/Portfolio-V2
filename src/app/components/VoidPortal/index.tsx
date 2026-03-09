"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

const CYAN = "#06B6D4";
const PURPLE = "#A855F7";
const PARTICLE_COUNT = 60;
const PHASE1_END = 600;
const PHASE2_END = 1200;
const PHASE3_END = 1800;
const SESSION_KEY = "void-portal-seen";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function cubicEaseOut(t: number): number {
  const t1 = t - 1;
  return t1 * t1 * t1 + 1;
}

export default function VoidPortal() {
  const [visible, setVisible] = useState(false);
  const [clipRadius, setClipRadius] = useState(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const flashRef = useRef(false);

  const initParticles = useCallback((width: number, height: number): Particle[] => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 1 + Math.random() * 2,
        color: Math.random() > 0.5 ? CYAN : PURPLE,
        alpha: 0,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    particlesRef.current = initParticles(width, height);
    startTimeRef.current = performance.now();
    flashRef.current = false;

    const cx = width / 2;
    const cy = height / 2;

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;

      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;

      // Phase 1: fade in, slow drift
      if (elapsed < PHASE1_END) {
        const progress = elapsed / PHASE1_END;
        for (const p of particles) {
          p.alpha = Math.min(1, progress * 1.2);
          p.x += p.vx;
          p.y += p.vy;
          drawParticle(ctx, p);
        }
      }

      // Phase 2: converge toward center, energy orb, light streaks
      else if (elapsed < PHASE2_END) {
        const progress = (elapsed - PHASE1_END) / (PHASE2_END - PHASE1_END);
        const pullForce = 0.02 + progress * 0.08;

        for (const p of particles) {
          const dx = cx - p.x;
          const dy = cy - p.y;
          p.vx += dx * pullForce * 0.01;
          p.vy += dy * pullForce * 0.01;
          p.vx *= 0.95;
          p.vy *= 0.95;
          p.x += p.vx;
          p.y += p.vy;
          p.alpha = 1;
          drawParticle(ctx, p);
        }

        // Energy orb
        const orbRadius = progress * 40;
        const orbGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius);
        orbGrad.addColorStop(0, `rgba(6, 182, 212, ${0.8 * progress})`);
        orbGrad.addColorStop(1, `rgba(168, 85, 247, ${0.2 * progress})`);
        ctx.beginPath();
        ctx.arc(cx, cy, orbRadius, 0, Math.PI * 2);
        ctx.fillStyle = orbGrad;
        ctx.fill();

        // Radial light streaks after 30% progress
        if (progress > 0.3) {
          const streakAlpha = (progress - 0.3) / 0.7;
          ctx.save();
          ctx.translate(cx, cy);
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            const streakLen = orbRadius + 60 * streakAlpha;
            ctx.lineTo(streakLen, 0);
            ctx.strokeStyle = `rgba(6, 182, 212, ${streakAlpha * 0.4})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.translate(cx, cy);
          }
          ctx.restore();
        }
      }

      // Phase 3: flash, clip shrink, orb shrink, no particles
      else if (elapsed < PHASE3_END) {
        const progress = (elapsed - PHASE2_END) / (PHASE3_END - PHASE2_END);

        // Brief cyan flash at start
        if (!flashRef.current) {
          flashRef.current = true;
          ctx.fillStyle = `rgba(6, 182, 212, 0.3)`;
          ctx.fillRect(0, 0, width, height);
        }

        // Shrink clip radius
        const newClipRadius = 100 * (1 - cubicEaseOut(progress));
        setClipRadius(newClipRadius);

        // Shrinking orb
        const orbRadius = 40 * (1 - progress);
        if (orbRadius > 0.5) {
          const orbGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius);
          orbGrad.addColorStop(0, `rgba(6, 182, 212, ${0.8 * (1 - progress)})`);
          orbGrad.addColorStop(1, `rgba(168, 85, 247, ${0.2 * (1 - progress)})`);
          ctx.beginPath();
          ctx.arc(cx, cy, orbRadius, 0, Math.PI * 2);
          ctx.fillStyle = orbGrad;
          ctx.fill();
        }
      }

      // Animation complete
      else {
        sessionStorage.setItem(SESSION_KEY, "true");
        setVisible(false);
        return;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, initParticles]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-[#0A0A0F]"
      style={{
        clipPath: `circle(${clipRadius}% at 50% 50%)`,
        willChange: "clip-path",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  const { r, g, b } = hexToRgb(p.color);

  // Glow effect
  if (p.alpha > 0.3) {
    const glowRadius = p.radius * 4;
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
    glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.3})`);
    glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.beginPath();
    ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();
  }

  // Core particle
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
  ctx.fill();
}

"use client";

import { useRef, useEffect } from "react";

interface Particle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wobbleSpeed: number;
  wobbleOffset: number;
  opacity: number;
}

const PARTICLE_COUNT = 18;

function getColorForY(y: number, height: number): string {
  const progress = y / height;
  if (progress < 0.25) return "6, 182, 212"; // cyan
  if (progress < 0.5) return "168, 85, 247"; // purple
  if (progress < 0.75) return "16, 185, 129"; // emerald
  return "6, 182, 212"; // cyan
}

export default function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 2 + Math.random() * 4,
      speed: 0.2 + Math.random() * 0.5,
      wobbleSpeed: 0.5 + Math.random() * 1.5,
      wobbleOffset: Math.random() * Math.PI * 2,
      opacity: 0.3 + Math.random() * 0.4,
    }));

    let time = 0;
    let isHidden = false;

    const handleVisibility = () => {
      isHidden = document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const animate = () => {
      if (isHidden) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particlesRef.current) {
        // Move upward
        p.y -= p.speed;
        // Wobble horizontally
        p.x += Math.sin(time * p.wobbleSpeed + p.wobbleOffset) * 0.3;

        // Wrap around
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        // Draw glow
        const color = getColorForY(p.y, canvas.height);
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.radius * 3
        );
        gradient.addColorStop(0, `rgba(${color}, ${p.opacity})`);
        gradient.addColorStop(0.4, `rgba(${color}, ${p.opacity * 0.4})`);
        gradient.addColorStop(1, `rgba(${color}, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
      aria-hidden="true"
    />
  );
}

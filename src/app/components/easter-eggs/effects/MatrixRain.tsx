"use client";

import { useEffect, useRef } from "react";

interface MatrixRainProps {
  duration?: number;
  onComplete: () => void;
}

const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";
const FONT_SIZE = 14;
const COLOR = "#06B6D4";
const FADE_COLOR = "rgba(10, 10, 15, 0.05)";

export default function MatrixRain({
  duration = 4000,
  onComplete,
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const columns = Math.floor(canvas.width / FONT_SIZE);
    const drops: number[] = Array.from(
      { length: columns },
      () => (Math.random() * -canvas.height) / FONT_SIZE,
    );

    let animationId: number;
    const startTime = Date.now();

    function draw() {
      if (!ctx || !canvas) return;

      const elapsed = Date.now() - startTime;
      const opacity =
        elapsed > duration - 1000
          ? Math.max(0, 1 - (elapsed - (duration - 1000)) / 1000)
          : 1;

      ctx.fillStyle = FADE_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = COLOR;
      ctx.font = `${FONT_SIZE}px monospace`;
      ctx.globalAlpha = opacity;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(char, i * FONT_SIZE, drops[i] * FONT_SIZE);

        if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      ctx.globalAlpha = 1;

      if (elapsed < duration) {
        animationId = requestAnimationFrame(draw);
      } else {
        onComplete();
      }
    }

    animationId = requestAnimationFrame(draw);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [duration, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
      aria-hidden="true"
    />
  );
}

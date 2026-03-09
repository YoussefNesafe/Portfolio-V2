# Void Portal Loading Screen — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a ~1.8s cinematic loading screen with particles converging into an iris reveal, shown once per session.

**Architecture:** A single client component (`VoidPortal`) renders as a fixed overlay at z-index 9999. It uses Canvas 2D for ~60 particles across 3 phases (drift → converge → reveal), then unmounts. Session check via `sessionStorage`.

**Tech Stack:** Canvas 2D, CSS clip-path, Framer Motion (for the overlay fade), sessionStorage

---

### Task 1: Create VoidPortal component with session gate

**Files:**
- Create: `src/app/components/VoidPortal/index.tsx`

**Step 1: Create the component shell with session check**

```tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const SESSION_KEY = "void-portal-seen";
const TOTAL_DURATION = 1800; // ms
const PHASE_1_END = 600;
const PHASE_2_END = 1200;
const PARTICLE_COUNT = 60;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

export default function VoidPortal() {
  const [visible, setVisible] = useState(false);
  const [clipRadius, setClipRadius] = useState(100); // percentage
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const startTimeRef = useRef(0);
  const animFrameRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Session gate — only show once per session
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem(SESSION_KEY);
    if (!seen) {
      setVisible(true);
    }
  }, []);

  // Initialize particles
  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    const colors = ["#06B6D4", "#A855F7", "#06B6D4", "#A855F7", "#06B6D4"];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 1 + Math.random() * 2,
        color: colors[i % colors.length],
        alpha: 0,
      });
    }
    return particles;
  }, []);

  // Main animation loop
  useEffect(() => {
    if (!visible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const centerX = w / 2;
    const centerY = h / 2;

    particlesRef.current = initParticles(w, h);
    startTimeRef.current = performance.now();

    function animate(now: number) {
      if (!ctx) return;
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / TOTAL_DURATION, 1);

      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;

      // Phase 1: Drift (0–0.6s) — particles fade in and float
      if (elapsed < PHASE_1_END) {
        const phaseProgress = elapsed / PHASE_1_END;
        for (const p of particles) {
          p.alpha = Math.min(phaseProgress * 1.5, 0.8);
          p.x += p.vx;
          p.y += p.vy;
        }
      }
      // Phase 2: Convergence (0.6–1.2s) — particles pull toward center
      else if (elapsed < PHASE_2_END) {
        const phaseProgress = (elapsed - PHASE_1_END) / (PHASE_2_END - PHASE_1_END);
        const pullStrength = 0.02 + phaseProgress * 0.08; // accelerating pull

        for (const p of particles) {
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          p.vx += (dx / (dist || 1)) * pullStrength * dist * 0.01;
          p.vy += (dy / (dist || 1)) * pullStrength * dist * 0.01;
          p.vx *= 0.95; // damping
          p.vy *= 0.95;
          p.x += p.vx;
          p.y += p.vy;
          p.alpha = 0.8 + phaseProgress * 0.2;
        }

        // Draw energy orb at center
        const orbRadius = phaseProgress * 40;
        const orbGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, orbRadius
        );
        orbGradient.addColorStop(0, `rgba(6, 182, 212, ${0.6 * phaseProgress})`);
        orbGradient.addColorStop(0.5, `rgba(168, 85, 247, ${0.3 * phaseProgress})`);
        orbGradient.addColorStop(1, "rgba(168, 85, 247, 0)");
        ctx.beginPath();
        ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
        ctx.fillStyle = orbGradient;
        ctx.fill();

        // Radial streaks
        if (phaseProgress > 0.3) {
          const streakAlpha = (phaseProgress - 0.3) * 0.3;
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const innerR = orbRadius * 0.5;
            const outerR = orbRadius + 60 * phaseProgress;
            ctx.beginPath();
            ctx.moveTo(
              centerX + Math.cos(angle) * innerR,
              centerY + Math.sin(angle) * innerR
            );
            ctx.lineTo(
              centerX + Math.cos(angle) * outerR,
              centerY + Math.sin(angle) * outerR
            );
            ctx.strokeStyle = `rgba(6, 182, 212, ${streakAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      // Phase 3: Iris reveal (1.2–1.8s) — overlay shrinks via clip-path
      else {
        const phaseProgress = (elapsed - PHASE_2_END) / (TOTAL_DURATION - PHASE_2_END);
        const eased = 1 - Math.pow(1 - phaseProgress, 3); // cubic ease out

        // Flash at the start of phase 3
        if (phaseProgress < 0.15) {
          const flashAlpha = (1 - phaseProgress / 0.15) * 0.6;
          ctx.fillStyle = `rgba(6, 182, 212, ${flashAlpha})`;
          ctx.fillRect(0, 0, w, h);
        }

        // Shrink clip radius to reveal site
        setClipRadius(100 * (1 - eased));

        // Draw remaining orb shrinking
        const orbRadius = 40 * (1 - eased);
        if (orbRadius > 1) {
          const orbGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, orbRadius
          );
          orbGradient.addColorStop(0, "rgba(6, 182, 212, 0.8)");
          orbGradient.addColorStop(1, "rgba(168, 85, 247, 0)");
          ctx.beginPath();
          ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
          ctx.fillStyle = orbGradient;
          ctx.fill();
        }
      }

      // Draw particles (phases 1 & 2)
      if (elapsed < PHASE_2_END + 100) {
        for (const p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color.replace(")", `, ${p.alpha})`).replace("rgb", "rgba").replace("#", "");
          // Use hex-to-rgba for the particle color
          const hex = p.color;
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
          ctx.fill();

          // Particle glow
          if (p.alpha > 0.3) {
            const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
            glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.3})`);
            glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();
          }
        }
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete — mark as seen and hide
        sessionStorage.setItem(SESSION_KEY, "true");
        setVisible(false);
      }
    }

    animFrameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [visible, initParticles]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
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
```

**Step 2: Verify component renders in isolation**

No test needed — this is a visual animation component. Verify via dev server.

**Step 3: Commit**

```bash
git add src/app/components/VoidPortal/index.tsx
git commit -m "feat: add VoidPortal loading screen component"
```

---

### Task 2: Integrate VoidPortal into public layout

**Files:**
- Modify: `src/app/(public)/layout.tsx`

**Step 1: Add dynamic import to public layout**

The public layout is a Server Component, so we need dynamic import with `ssr: false` via a client wrapper, OR import it directly since VoidPortal is already a client component with its own session check.

Add to `src/app/(public)/layout.tsx`:

```tsx
// Add import at top (after existing imports):
import dynamic from "next/dynamic";

const VoidPortal = dynamic(() => import("@/app/components/VoidPortal"), {
  ssr: false,
});
```

Then add `<VoidPortal />` as the first child inside `<ViewModeProvider>`:

```tsx
<ViewModeProvider>
  <VoidPortal />
  <CanvasLayers />
  {/* ... rest unchanged */}
</ViewModeProvider>
```

**Note:** `dynamic` with `ssr: false` requires the layout to be a Client Component OR we wrap it. Since the layout is a Server Component that uses `async`, we need a different approach. Instead, create a tiny client wrapper:

Actually, the existing `CanvasLayers` component already uses this pattern — it's a client component imported normally into the server layout. Since `VoidPortal` has `"use client"` at the top, we can import it directly. But `ssr: false` won't work in a server component.

**Better approach:** Import VoidPortal directly (it's a client component). The session check in `useEffect` already handles the client-only behavior. The canvas won't render on the server since `useEffect` doesn't run during SSR, and `visible` starts as `false`.

```tsx
import VoidPortal from "@/app/components/VoidPortal";
```

Add `<VoidPortal />` before `<CanvasLayers />`.

**Step 2: Test in dev server**

Run: `npm run dev`
- First visit: should see particle animation → iris reveal → site appears
- Refresh: should skip straight to site (sessionStorage check)
- New tab/incognito: should see animation again

**Step 3: Build check**

Run: `npx next build`
Expected: Build succeeds with no type errors

**Step 4: Commit**

```bash
git add src/app/\(public\)/layout.tsx
git commit -m "feat: integrate VoidPortal loading screen into public layout"
```

---

### Task 3: Polish and verify

**Step 1: Test on mobile viewport (375px)**

Use browser devtools or Playwright to verify:
- Particles are visible and converge properly on small screens
- Iris reveal works smoothly
- No overflow/scrollbar issues during animation

**Step 2: Test sessionStorage behavior**

- Visit site → see animation → refresh → should skip
- Clear sessionStorage → refresh → should see animation again
- Open new session (incognito) → should see animation

**Step 3: Final build verification**

Run: `npx next build`
Expected: Clean build, no errors

**Step 4: Commit and push**

```bash
git push
```

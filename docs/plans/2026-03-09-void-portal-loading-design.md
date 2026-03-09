# Void Portal Loading Screen — Design

## Overview

A ~1.8s cinematic intro where particles emerge from the void, converge toward a center point, then trigger an iris-circle reveal expanding to show the site. Plays on first visit per session only.

## Sequence

### Phase 1: Void (0–0.6s)
- Black screen, `position: fixed; inset: 0; z-index: 9999`
- ~60 small particles fade in at random positions, drifting slowly
- Colors: cyan (#06B6D4) and purple (#A855F7) at low opacity
- Particles have slight size variation (1–3px radius)

### Phase 2: Convergence (0.6–1.2s)
- Particles accelerate toward viewport center using easing (exponential pull)
- A glowing energy orb grows at center: radial gradient cyan→purple, 0→40px radius
- Faint radial light streaks appear (CSS pseudo-element or canvas lines from particle trails)
- Particle speed increases as they approach center (gravity simulation)

### Phase 3: Iris Reveal (1.2–1.8s)
- Energy orb reaches critical mass → brief bright flash (opacity pulse)
- `clip-path: circle()` on the overlay shrinks OR the site container uses expanding `clip-path: circle()` from center
- Reuse the existing `iris-in` keyframe pattern from `tailwind.css`
- Loading overlay fades to `opacity: 0` and unmounts via state

## Technical Design

### Component: `VoidPortal`
- Client component (`"use client"`)
- Uses `Canvas 2D` for particles (no Three.js — lightweight)
- Renders as fixed overlay on top of everything
- State: `isComplete` → when true, unmounts from DOM

### Particle System (Canvas 2D)
- ~60 particles, each with: `x, y, vx, vy, radius, color, alpha`
- Phase 1: random positions, slow random drift
- Phase 2: calculate vector toward center, apply increasing force (lerp toward center with accelerating t)
- Phase 3: particles at center, stop rendering, trigger reveal

### Iris Reveal
- CSS transition on the overlay element: `clip-path: circle(100% at 50% 50%)` → `circle(0% at 50% 50%)` (shrinking overlay to reveal site)
- OR: expanding clip-path on a wrapper around the site content
- Duration: ~600ms, `cubic-bezier(0.4, 0, 0.2, 1)`

### Session Check
- On mount: check `sessionStorage.getItem('void-portal-seen')`
- If seen: don't render, return `null`
- After animation completes: `sessionStorage.setItem('void-portal-seen', 'true')`

### Placement
- Import in `src/app/(public)/layout.tsx` (or root layout)
- Render before all other content
- `z-index: 9999` to overlay everything including header, canvas layers

### Performance
- Canvas 2D with 60 particles is trivial (~0.1ms per frame)
- No external dependencies
- `will-change: clip-path` on the overlay for GPU acceleration
- Component fully unmounts after animation — zero ongoing cost

## What This Does NOT Include
- No progress bar or percentage
- No text or logo (too short to read)
- No sound
- No dependency on actual load state — purely timed cinematic
- No Three.js or heavy dependencies

## Files to Create/Modify
- **Create**: `src/app/components/VoidPortal/index.tsx`
- **Modify**: `src/app/(public)/layout.tsx` — add VoidPortal import

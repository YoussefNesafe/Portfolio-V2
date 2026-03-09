# Living Canvas — Organic Visual Overhaul Design

**Date:** 2026-03-09
**Goal:** Transform the portfolio from a terminal-themed dark site into an organic, fluid, WebGL-powered visual experience that feels alive and memorable. Remove terminal UI from portfolio sections (keep dev mode as hidden feature).

## 1. WebGL Background Layer — Fluid Gradient Mesh

Full-page fixed WebGL canvas (React Three Fiber) rendering a subdivided plane with simplex noise vertex displacement. Slow organic undulations.

- Colors shift with scroll: cyan (Hero) → purple (Experience) → emerald (Projects) → cyan/purple blend (Contact)
- Cursor proximity repels/attracts vertices within ~200px radius (subtle ripple)
- Scroll position feeds noise seed — mesh shape evolves during navigation
- Opacity 15-20% — atmospheric, not distracting
- Mobile: fewer vertices, no cursor interaction, scroll-linked color shift only
- Fallback: CSS animated gradient if no WebGL

**Tech:** `@react-three/fiber`, `@react-three/drei`, custom GLSL fragment shader, simplex noise

## 2. Hero — 3D Floating Geometry + Reveal

- Slowly rotating wireframe icosahedron with glass material, floating center-right, glowing cyan edges
- Tilts toward cursor position
- Content reveal: name via clip-path expanding from center, title/tagline blur-to-sharp + opacity, CTAs spring scale-in
- Remove typewriter greeting box — replace with simple mono-text label fade-in
- On scroll past: icosahedron dissolves into particles that drift upward (visual send-off)
- Mobile: 2D SVG wireframe icosahedron with CSS rotation, same content reveals

## 3. About — Glassmorphism Cards + Mask Reveal

- Remove terminal `cat about.txt` component
- Left: bio text revealed through scroll-linked gradient mask wipe (line by line cinematic uncovering)
- Right: stat cards with glassmorphism (backdrop-blur, semi-transparent, border glow), small animated gradient orb behind each card
- Stat counters: keep overshoot easing, add slot-machine digit roll effect
- Large soft gradient orb behind section, slowly morphing, bleeds into adjacent sections

## 4. Experience — Flowing River Path

- Remove vertical timeline line and dot indicators
- Flowing SVG path curving organically down the page, gradient stroke (cyan→purple), animated glow pulse along length
- Cards positioned along path curves, alternating sides on desktop
- Glassmorphism card style, connected to path via thin glowing tendrils
- Cards fade in + slide from path direction on viewport entry
- Path draws itself progressively via `stroke-dashoffset` driven by scroll
- Mobile: straight vertical flowing line with same progressive draw, cards stack left-aligned

## 5. Projects — Depth-of-Field Showcase

- Stacked card carousel with depth — one project "in focus" (foreground, sharp), adjacent visible behind (smaller, blurred, dimmed)
- Scroll-snap between projects, 600ms spring transition (scale + blur shift)
- Keep 3D tilt on focused card
- Ken Burns effect on project image while in focus
- Tech tags float in from bottom with stagger on card focus
- Navigation dots: small glowing orbs connected by thin line (echoing river path)
- Mobile: horizontal swipe carousel, one card at a time, same blur/sharp transition

## 6. Skills — Constellation Node Graph

- Remove badge grid layout
- Desktop: force-directed constellation map. Each skill is a glowing node, related skills connected by thin lines. Color clusters by category (cyan=Frontend, purple=State/Data, emerald=Styling, etc.)
- Nodes gently float with subtle physics
- Hover: node brightens, connections highlight, tooltip with skill name + icon
- Cursor proximity causes gentle repulsion (force field), then settle
- Scroll entry: nodes fly in from random positions, settle into constellation (1.5s spring)
- Category labels: floating text near clusters, fade in after nodes settle
- Mobile/tablet: animated bubble grid, circles of varying sizes, scale in with stagger, tap to see name
- Tech: Canvas 2D (not WebGL), simple spring physics in rAF loop

## 7. Contact — Gravity-Reactive Floating Cards

- Remove terminal code snippet
- Cards float freely with subtle sine-wave bobbing, different phases
- Cursor acts as gravity well — cards attracted toward cursor, collision avoidance
- Hover: card stops drifting, lifts (scale + shadow), icon pulses with glow ring
- Click/tap: ripple emanates from card outward
- Cursor leave: cards drift back to rest positions with spring physics
- Background: large soft aurora gradient wash, slowly shifting. WebGL mesh intensifies in this section.
- CTA: "Let's work together" line + email link with gradient underline animation
- Mobile: 2x2 grid (no floating), keep hover glow and tap ripple. Aurora gradient visible.

## 8. Section Transitions

- Remove SectionDivider gradient lines
- Color bleeding: section accent orbs extend into neighbors, creating blend zones
- Continuous particle drift: small glowing dots (4-6px) drift upward across full page. ~15-20 visible, change color by section.
- Scroll-linked opacity crossfade: departing section accents fade, arriving section fades in. 200px overlap zone.
- Hero→About special: icosahedron dissolves into the continuous particle system
- Tech: single fixed canvas layer for particles, pointer-events: none

## 9. Performance & Technical Strategy

### Bundle
- `@react-three/fiber` + `@react-three/drei` via `next/dynamic` with `ssr: false`
- Single fixed WebGL canvas in public layout
- Skills constellation uses Canvas 2D separately

### Render Budget
- WebGL mesh: ~30fps (slow organic motion)
- Particle canvas: 60fps, minimal draw calls
- Constellation canvas: 60fps during entry animation, 30fps once settled
- All canvases pause when tab hidden (`document.hidden`)

### Mobile
- WebGL mesh: 4x fewer vertices, no cursor interaction
- Hero: 2D SVG wireframe instead of Three.js
- Skills: bubble grid instead of constellation
- Contact: static grid instead of floating physics
- Particles: reduce to ~8 count
- Detect via `useIsMobile` hook with `matchMedia`

### Accessibility
- All canvas layers: `aria-hidden="true"`, `pointer-events: none`
- `useReducedMotion` disables all canvas animations → static gradient backgrounds
- Content remains semantic HTML, canvases purely decorative

### Fallback Chain
1. WebGL available → full experience
2. WebGL unavailable → CSS animated gradients + canvas 2D
3. Reduced motion → static gradients, no animation

## What Gets Removed
- Terminal component from About section (`cat about.txt`)
- Terminal component from Contact section (code snippet)
- Typewriter greeting box in Hero
- SectionDivider gradient lines
- Vertical timeline line + dots in Experience
- Badge grid layout in Skills
- AnimatedText typewriter component (from portfolio sections only — keep in dev mode)

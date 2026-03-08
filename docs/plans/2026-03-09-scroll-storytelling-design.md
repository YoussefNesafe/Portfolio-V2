# Scroll Storytelling & Performance Design

**Date:** 2026-03-09
**Goal:** Transform the homepage from "sections that fade in" to a guided visual journey with bold scroll-linked animations, magnetic cursor interactions, and performance/UX fixes.

## 1. Scroll-Linked Animation System (Infrastructure)

### `useScrollProgress` Hook
- Wraps Framer Motion's `useScroll` + `useTransform` to give any element a 0→1 progress value as it scrolls through the viewport.

### Parallax Layers
- Floating elements (gradient blobs, grid, decorative icons) move at different speeds based on scroll position.
- `will-change: transform` on parallax elements.

### Text Reveal Animations
- Headings split into words/characters that animate in with stagger (opacity + y-translate), driven by scroll progress.
- New `SplitText` component handles word splitting + Framer Motion orchestration.

### Section Connectors
- Subtle gradient dividers or flowing SVG curves between sections for continuous flow.

### Performance Guardrails
- All animations use `transform` and `opacity` only (GPU-accelerated).
- Disable parallax on mobile (keep simple fade-in), enable from tablet up.
- Use `useReducedMotion` hook to respect user OS preferences.

## 2. Per-Section Enhancements

### Hero
- Parallax depth: blobs at 0.3x, grid at 0.5x, content at 1x scroll speed.
- Word-by-word text reveal with spring physics.
- Scroll indicator fades out + translates down as user starts scrolling (scroll-linked).

### About
- Terminal typewriter effect: character-by-character typing with blinking cursor and random delay.
- Counter overshoot: stats overshoot target by ~5% then spring back (bounce easing).
- Parallax split: terminal from left, stats from right at different scroll speeds.

### Experience
- Timeline scrub: glowing line height driven by scroll position (fills as you scroll).
- Alternating card entry: left/right on desktop.
- Staggered child reveals: title → description → tags animate in sequence per card.

### Projects
- 3D tilt on hover: cards rotate toward cursor position (perspective transform).
- Image parallax: images translate Y within overflow-hidden container on scroll.
- Cursor-following glow: cyan border glow intensifies near cursor position.

### Skills
- Orbital/constellation layout on desktop: radial arrangement with connecting lines.
- Mobile/tablet fallback: current grid with staggered scale-in per badge.
- Hover ripple: hovering a badge sends pulse to adjacent badges.

### Contact
- Card lift: translateY + shadow growth on hover with spring physics.
- Terminal typing: code snippet types out when scrolled into view.

## 3. Magnetic Cursor & Micro-Interactions

### Magnetic Cursor
- Cursor grows/changes style on hover over interactive elements.
- Buttons/CTAs pull subtly toward cursor within ~50px radius, snap back on leave.
- Text label mode: "View" on project cards, "Click" on CTAs.

### Micro-Interactions
- Section headings: gradient underline animates in from left on viewport entry.
- Buttons: scale(0.97) on mousedown, scale(1) on release (tactile click).
- Links: underline slides in from left on hover, out to right on leave.
- Tech badges: slight rotate(2deg) + translateY lift on hover.
- Social icons: bounce on hover with spring physics.

### View Transition Fix
- Iris reveal from click position (not always center).
- Duration reduced to 800ms (from 1400ms).
- Subtle pulse overlay during transition.

## 4. Performance & UX Fixes

### High Priority
- Lazy load `InteractiveTerminal` via `next/dynamic` with `ssr: false`.
- Add `blurDataURL` placeholders for project images.
- Custom cyan glow focus rings on all interactive elements (`:focus-visible`).

### Medium Priority
- JSON-LD structured data: Organization schema on homepage, Article on blog posts.
- Ensure all touch targets meet 44px minimum on mobile.
- Reduce hero top padding on mobile (currently 26.7vw).
- Add skip-to-content link for accessibility.

### Scoped Out
- Recharts lazy loading (brag section, not homepage).
- `sanitize-html` server-only migration.
- Story game canvas accessibility.

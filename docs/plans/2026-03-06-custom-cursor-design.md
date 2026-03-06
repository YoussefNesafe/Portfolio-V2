# Custom Cursor Effects Design

## Goal

A glowing dot follower with a spotlight/radial gradient effect that tracks the cursor across the portfolio. The dot changes color per section to match the site's accent palette. Desktop only.

## Cursor Dot

- Small glowing circle (~8px) follows the mouse
- Trailing delay via CSS `transition: transform 80ms ease-out`
- Soft `box-shadow` glow matching current color
- Fades out when cursor leaves viewport

### Section Color Mapping

| Section | Color |
|---------|-------|
| Default / Hero | accent-cyan (#06B6D4) |
| About | accent-purple (#A855F7) |
| Experience | accent-purple (#A855F7) |
| Projects | accent-emerald (#10B981) |
| Skills | accent-cyan (#06B6D4) |
| Contact | accent-emerald (#10B981) |

## Spotlight Effect

- Full-viewport fixed div with `pointer-events: none`
- `radial-gradient(circle at var(--cursor-x) var(--cursor-y), rgba(color, 0.06) 0%, transparent 60%)`
- Gradient color matches dot color (changes per section)
- Low opacity (5-7%) — atmospheric, not distracting
- No transition delay — tracks cursor directly
- z-index: 1 (behind content); dot at z-index: 50 (above content)

## Architecture

```
src/app/components/cursor/
  CustomCursor.tsx      - "use client" component: dot + spotlight + mousemove listener
  useMousePosition.ts   - Hook: tracks mouse x/y, sets CSS vars, detects active section
```

### Data Flow

1. `useMousePosition` hook adds `mousemove` listener on `document`
2. Tracks `clientX`/`clientY`, determines active section via `document.elementsFromPoint()` checking for nearest `<section id="...">` ancestor
3. Returns `{ x, y, sectionColor, isVisible }` — `isVisible` false on `mouseleave`
4. `CustomCursor` renders two fixed divs (dot + spotlight) positioned via inline `transform: translate()`
5. Native cursor hidden with `cursor: none` on `<body>` via CSS class on mount, removed on unmount
6. Only renders on desktop (`window.matchMedia` for `min-width: 1024px`)

### Integration

- Add `<CustomCursor />` in `HomeContent.tsx`, outside XRayProvider, visible in designer mode
- Hidden in dev/terminal mode (useViewMode check)
- No data attributes needed — uses existing `<section id="...">` elements

## Performance

- `mousemove` throttled with `requestAnimationFrame` (60fps max)
- Dot positioned with `transform: translate3d()` (GPU-accelerated)
- Spotlight uses CSS variables in gradient — no React re-renders, style updates via ref
- `will-change: transform` on dot div

## Edge Cases

- **Cursor leaves viewport:** dot fades out, spotlight disappears
- **X-Ray mode active:** both work independently (X-Ray is pointer-events: none)
- **Dev mode:** component returns null
- **SSR:** guarded with typeof window + useEffect mount check
- **Mobile/tablet:** doesn't render (matchMedia at 1024px)

## No New Dependencies

Uses DOM APIs, CSS transforms, CSS custom properties. No additional packages.

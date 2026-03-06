# "View Source" X-Ray Mode Design

## Goal

An interactive design specs overlay for the portfolio. Visitors click a floating eye button to toggle X-Ray mode, then hover over sections and components to see their computed CSS properties in a floating tooltip — like Figma inspect mode built into the site.

## Activation

- Floating eye icon button, bottom-right, separate from the existing Designer/Dev toggle
- Click toggles X-Ray mode on/off
- Active state: cyan glow ring on the button
- X-Ray works on top of designer mode (overlay, not replacement)
- Button hidden when terminal (dev) mode is active

## Inspectable Elements

Two levels of granularity, marked with `data-xray="Label"` attributes:

**Section-level:** Hero, About, Experience, Projects, Skills, Contact

**Component-level:** ProjectCard, TechBadge, TimelineItem, Terminal, GlowCard, SectionHeading, AnimatedCounter (stats)

Nesting: most specific target wins (component over section). No double outlines.

## Hover Behavior

When X-Ray is active and user hovers an inspectable element:

1. Dashed cyan outline appears around the element
2. Label badge at top-left corner of the outline (e.g., "ProjectCard")
3. Floating tooltip card appears near cursor with computed specs

## Tooltip Content

Specs read dynamically via `getComputedStyle()` + `getBoundingClientRect()`, grouped:

**Layout:** dimensions (w x h), padding, margin, display type, gap

**Typography** (only if element has text): font family, font size, font weight, line height, color with swatch

**Visual:** background color with swatch, border, border-radius, box-shadow

**Tooltip styling:** dark card (bg-bg-secondary, border-border-subtle), monospace text, inline color swatches, ~300px max width, flips position near viewport edges.

## Architecture

```
src/app/components/xray/
  XRayContext.tsx        - Context + provider (isActive, toggle)
  XRayToggle.tsx         - Floating eye button (bottom-right)
  XRayOverlay.tsx        - Outline + label on hovered element
  XRayTooltip.tsx        - Specs tooltip card
  hooks/
    useElementSpecs.ts   - getComputedStyle() reader + formatter
```

**Data flow:**

1. XRayContext provides `{ isActive, toggle }` globally
2. XRayToggle calls `toggle()` on click
3. When active, global `mouseover` listener on document checks if hovered element (or nearest ancestor) has `data-xray`
4. Match found: XRayOverlay renders positioned outline + label via `getBoundingClientRect()`
5. `useElementSpecs` reads `getComputedStyle()` and formats values
6. XRayTooltip renders formatted specs near cursor

**Integration:**

- XRayProvider wraps content in HomeContent.tsx (inside ViewModeProvider)
- XRayToggle rendered alongside ViewModeToggle, hidden when mode === "dev"
- `data-xray` attributes added to existing section/component markup

**No new dependencies.** Uses DOM APIs, React context, Framer Motion (already installed).

## Testing

**Unit tests** (useElementSpecs):
- Formats padding/margin values correctly
- Returns typography only for text elements
- Handles missing/zero values
- Converts rgb() to hex

**Visual verification** via Playwright screenshots:
- Tooltip appears on hover
- Outline + label at correct position
- Tooltip flips near edges
- Button hidden in dev mode

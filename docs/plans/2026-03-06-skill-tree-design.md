# Skill Tree Visualization Design

## Summary

Replace the existing Skills section badge grid with an interactive, RPG-inspired radial skill tree. Skills are displayed as connected nodes radiating from a central core, with three experience tiers and hover-driven interactions.

## Decisions

| Decision | Choice |
|----------|--------|
| Location | Replace existing Skills section (all visitors) |
| Visual style | RPG/Gaming skill tree |
| Proficiency model | 3 tiers: Expert, Proficient, Familiar |
| Interaction | Hover to reveal tooltip + highlight connections |
| Layout | Fixed section (no zoom/pan) |
| Rendering | SVG for connections, React components for nodes |
| Tree layout | Radial (desktop/tablet), vertical (mobile) |

## Layout & Visual Structure

### Desktop

A radial tree centered in the skills section. A glowing central "Core" node in the middle. Five category branches radiate outward at roughly equal angles (~72 deg apart). Each category node connects to its child skill nodes which fan out further. Total radius fits within the section container.

### Tablet

Same radial layout, scaled down proportionally using vw units. Node sizes and gaps shrink but tree shape is preserved.

### Mobile

The radial layout collapses into a vertical tree. Core node at top, categories stack vertically below, each category's skills branch horizontally to the right.

### Node Hierarchy

1. **Core node** (center) -- largest, glowing cyan/purple gradient border
2. **Category nodes** (5) -- medium size, colored per category, with category name label
3. **Skill nodes** (25) -- smallest, show SimpleIcon + name, styled by tier

### SVG Connections

Curved `<path>` elements (quadratic bezier) connecting parent to child nodes. Paths have a subtle glow effect using SVG filters (feGaussianBlur + color overlay). Each category's paths use that category's accent color.

## Tier System & Node Styling

### Three Tiers

| Tier | Label | Node Style | Glow | Border |
|------|-------|-----------|------|--------|
| Expert | "Mastered" | Full brightness, strong glow, filled background | Bright outer glow matching skill color | Solid, 2px |
| Proficient | "Proficient" | Medium brightness, subtle glow | Soft outer glow | Solid, 1px |
| Familiar | "Familiar" | Dimmed, no glow | None | Dashed, 1px |

### Tier Assignments

- **Expert:** React, Next.js, TypeScript, JavaScript, Tailwind CSS, Git, SASS/SCSS
- **Proficient:** Vue.js, GraphQL, Apollo Client, React Query, Redux, REST APIs, Material-UI, Jest, Cypress, Testing Library, Docker, Vite
- **Familiar:** Zustand, WebSocket, Quasar, Vuetify, GitHub Actions, Webpack

### Data

Add `tier` field to each skill in `en.json` dictionary (`"expert"` | `"proficient"` | `"familiar"`). Extend existing `Skill` interface with optional `tier` field.

## Animation & Interaction

### Initial Load (Viewport Entry)

1. Core node fades in and scales up first (0.3s)
2. Category nodes animate in staggered, radiating outward (0.05s each)
3. SVG connection paths draw themselves using pathLength animation (stroke-dashoffset trick) -- paths "grow" from core outward
4. Skill nodes fade in last, staggered per category (0.03s each)
5. Total animation sequence: ~1.5s

### Hover Interactions

- **Skill node hover:** Node scales to 1.1x, glow intensifies, tooltip fades in. Path from node to its category brightens.
- **Category node hover:** All skills in that category glow brighter, all paths in that branch brighten. Other categories dim to 0.3 opacity. Spotlight effect.
- **Core node hover:** All branches light up sequentially in a quick pulse animation.

### Mobile

Hover effects become tap effects. Tapping a category expands/collapses its skills. Tapping a skill shows tooltip as a small card below the node.

### Performance

All animations use CSS transforms and opacity only (GPU-accelerated). SVG filters applied via CSS classes. Framer Motion for entry animations, CSS for hover states.

## Component Architecture

### Components

- `SkillTree` -- main container, replaces current SkillsSection content. Calculates node positions, renders SVG layer + node layer.
- `SkillTreeDesktop` -- radial layout logic. Computes x/y positions given container dimensions.
- `SkillTreeMobile` -- vertical tree layout logic for mobile.
- `SkillTreeConnections` -- SVG component rendering all bezier paths.
- `SkillTreeNode` -- individual node (core, category, or skill). Handles hover state, renders icon + label.
- `SkillTreeTooltip` -- positioned tooltip on hover showing skill details.

### Data Flow

1. Dictionary `en.json` skills data with added `tier` field.
2. `SkillsSection` passes skills data to `SkillTree` (client component for hover/animation).
3. `SkillTree` uses `useSkillTreeLayout` hook that computes node positions from container ref via ResizeObserver. Returns `{ nodes: NodePosition[], connections: Connection[] }`.
4. Pure layout functions (testable): `computeRadialLayout()` and `computeVerticalLayout()`.

### Dependencies

No external libraries. React, SVG, Framer Motion (existing), SimpleIcons (existing).

### Testing

Pure layout functions get unit tests (node positions, connection paths). Logic extracted from hooks into pure functions for testability.

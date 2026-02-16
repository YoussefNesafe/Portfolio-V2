---
name: design-system
description: Reference for the project's vw-based responsive design system, color palette, utility classes, and styling conventions. Use when writing or modifying component styles, calculating vw values, or applying responsive breakpoints.
user-invocable: true
disable-model-invocation: false
allowed-tools: Read, Grep, Glob
---

# Design System Reference

This project uses a **viewport-width (vw) based responsive styling system**.

## Breakpoints

There are two separate concepts:

### Breakpoint Triggers (when Tailwind prefixes activate)

| Name    | Min-width | Tailwind prefix |
|---------|-----------|-----------------|
| Mobile  | 0px       | _(none)_        |
| Tablet  | 481px     | `tablet:`       |
| Desktop | 1024px    | `desktop:`      |

Defined in `tailwind.config.ts`:
```ts
screens: {
  tablet: "481px",
  desktop: "1024px",
}
```

### Design Viewports (for vw math)

These are the reference widths used in the vw conversion formula — they represent the target design size at each breakpoint, **not** the breakpoint trigger values:

| Breakpoint | Design viewport |
|------------|-----------------|
| Mobile     | 375px           |
| Tablet     | 800px           |
| Desktop    | 1920px          |

## VW Conversion Formula

```
vw_value = desired_px / design_viewport * 100
```

- **Mobile:** `px / 375 * 100`
- **Tablet:** `px / 800 * 100`
- **Desktop:** `px / 1920 * 100`

## Conversion Table

| px  | Mobile (÷375) | Tablet (÷800) | Desktop (÷1920) |
|-----|---------------|---------------|-----------------|
| 1   | 0.267vw       | 0.125vw       | 0.052vw         |
| 2   | 0.533vw       | 0.25vw        | 0.104vw         |
| 4   | 1.067vw       | 0.5vw         | 0.208vw         |
| 6   | 1.6vw         | 0.75vw        | 0.313vw         |
| 8   | 2.133vw       | 1vw           | 0.417vw         |
| 10  | 2.667vw       | 1.25vw        | 0.521vw         |
| 12  | 3.2vw         | 1.5vw         | 0.625vw         |
| 14  | 3.733vw       | 1.75vw        | 0.729vw         |
| 16  | 4.267vw       | 2vw           | 0.833vw         |
| 18  | 4.8vw         | 2.25vw        | 0.938vw         |
| 20  | 5.333vw       | 2.5vw         | 1.042vw         |
| 24  | 6.4vw         | 3vw           | 1.25vw          |
| 28  | 7.467vw       | 3.5vw         | 1.458vw         |
| 32  | 8.533vw       | 4vw           | 1.667vw         |
| 40  | 10.667vw      | 5vw           | 2.083vw         |
| 48  | 12.8vw        | 6vw           | 2.5vw           |
| 56  | 14.933vw      | 7vw           | 2.917vw         |
| 60  | 16vw          | 7.5vw         | 3.125vw         |
| 64  | 17.067vw      | 8vw           | 3.333vw         |
| 80  | 21.333vw      | 10vw          | 4.167vw         |
| 100 | 26.667vw      | 12.5vw        | 5.208vw         |

## Usage Pattern

Always specify all 3 breakpoints using Tailwind arbitrary values:

```tsx
// 16px padding at all viewports
className="p-[4.267vw] tablet:p-[2vw] desktop:p-[0.833vw]"

// 14px font size at all viewports
className="text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw]"

// 8px gap at all viewports
className="gap-[2.133vw] tablet:gap-[1vw] desktop:gap-[0.417vw]"

// 10px border-radius at all viewports
className="rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw]"

// 2px border at all viewports
className="border-[0.533vw] tablet:border-[0.25vw] desktop:border-[0.104vw]"
```

**Text sizing is always done inline** with the three-breakpoint vw pattern shown above. There are no predefined text size utility classes — never use Tailwind's built-in `text-sm`, `text-base`, `text-lg`, etc.

## Color Palette

Defined in `tailwind.config.ts` → `theme.extend.colors`:

| Tailwind class      | Hex       | Usage                        |
|---------------------|-----------|------------------------------|
| `bg-background`     | `#0A0A0F` | Main background (blue-black) |
| `bg-bg-secondary`   | `#12121A` | Cards, elevated surfaces     |
| `bg-bg-tertiary`    | `#1A1A2E` | Hover states, terminal bars  |
| `text-foreground`   | `#E4E4E7` | Body text (zinc-200)         |
| `text-text-heading`  | `#FAFAFA` | Headings (zinc-50)           |
| `text-text-muted`   | `#A1A1AA` | Secondary text (zinc-400)    |
| `text-accent-cyan`  | `#06B6D4` | Primary accent               |
| `text-accent-purple`| `#A855F7` | Secondary accent             |
| `text-accent-emerald`| `#10B981`| Terminal/code green          |
| `border-border-subtle`| `#1E1E2E`| Subtle borders             |

**Gradients:** Cyan `#06B6D4` → Purple `#A855F7` for CTAs and highlights.
**Glow effects:** `box-shadow: 0 0 20px rgba(6,182,212,0.3)` on hover.

## Pre-built CSS Utility Classes

Defined in `src/app/styles/tailwind.css`:

### Section Spacing
- `.section-mt` — margin-top: 16vw / 10vw / 5vw
- `.section-mb` — margin-bottom: 16vw / 10vw / 5vw
- `.section-pt` — padding-top: 16vw / 10vw / 5vw
- `.section-pb` — padding-bottom: 16vw / 10vw / 5vw

### Visual Effects
- `.gradient-text` — cyan-to-purple `background-clip: text`
- `.gradient-text-emerald` — emerald-to-cyan `background-clip: text`
- `.glow-cyan` — `box-shadow: 0 0 20px rgba(6,182,212,0.3)`
- `.glow-cyan-lg` — `box-shadow: 0 0 40px rgba(6,182,212,0.2)`
- `.glow-purple` — `box-shadow: 0 0 20px rgba(168,85,247,0.3)`
- `.gradient-border` — mask-composite gradient border
- `.btn-gradient` — animated gradient button (left→right on hover)

### Other
- `.border-1-vw` — responsive 1px border width
- `.no-scrollbar` — hide scrollbar cross-browser

## Section Container

All `<section>` and `.section-container` elements automatically get responsive side padding via **custom media queries** in the base CSS layer. Note: these use raw media queries at 800px and 1920px, which are the design viewports — **not** Tailwind's breakpoint triggers (481px/1024px):

```css
/* Base (mobile): */  padding: 0 4.267vw;   /* ~16px at 375px */
/* @media (800px): */ padding: 0 5vw;       /* ~40px at 800px */
/* @media (1920px):*/ padding: 0 14.063vw;  /* ~270px at 1920px */
```

## Heading Typography (Base Layer)

```
h1: text-[10.667vw] / tablet:text-[6vw] / desktop:text-[3.333vw] — bold
h2: text-[8.533vw]  / tablet:text-[4vw] / desktop:text-[2.083vw] — bold
h3: text-[5.333vw]  / tablet:text-[2.5vw] / desktop:text-[1.25vw] — semibold
h4: text-[4.267vw]  / tablet:text-[2vw] / desktop:text-[1.042vw] — semibold
p:  text-[4.267vw]  / tablet:text-[2vw] / desktop:text-[0.833vw]
```

## Animations

Defined in `tailwind.config.ts`:
- `animate-blink-cursor` — blinking cursor for typewriter effect
- `animate-float` — 6s floating up/down
- `animate-float-slow` — 8s floating up/down
- `animate-float-slower` — 10s floating up/down
- `animate-gradient-shift` — 3s gradient background animation
- `animate-wave-glow` — 6s scale + opacity pulse

Framer Motion variants in `src/app/lib/animations.ts`:
- `fadeUp`, `fadeLeft`, `fadeRight`, `scaleUp`
- `staggerContainer`, `fastStaggerContainer`
- `defaultViewport = { once: true, amount: 0.3 }`

## Utilities

- **`cn()`** at `src/app/utils/cn.ts` — merges classes via `clsx` + `tailwind-merge`
- **`getBpClassName()`** at `src/app/utils/getBpClassName.ts` — programmatic `tablet:` / `desktop:` prefixing

## Key Config Files

- `tailwind.config.ts` — breakpoints, colors, fonts, keyframes, animations
- `src/app/styles/tailwind.css` — base layer, component layer, utility classes

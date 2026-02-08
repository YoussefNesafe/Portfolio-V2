---
name: project-structure
description: Reference for the project's folder structure, architecture patterns, dictionary system, models, and component organization. Use when creating new components, sections, or modifying the project architecture.
user-invocable: true
disable-model-invocation: false
allowed-tools: Read, Grep, Glob
---

# Project Structure Reference

This portfolio follows the **Multibank holding-web-app** architecture pattern with Next.js 16 App Router.

## Directory Tree

```
new-portfolio/
├── tailwind.config.ts                 # Breakpoints, colors, fonts, keyframes
├── postcss.config.mjs                 # PostCSS with @tailwindcss/postcss
├── tsconfig.json                      # TypeScript config (paths: @/* → ./src/*)
├── next.config.ts                     # Next.js config
├── package.json
│
└── src/
    ├── get-dictionary.ts              # Dictionary loader (async, server-side)
    │
    ├── dictionaries/
    │   └── en.json                    # ALL text content, structured by section
    │
    └── app/
        ├── layout.tsx                 # Root layout: fonts, metadata, CSS import
        ├── page.tsx                   # Server component: loads dict, composes sections
        │
        ├── styles/
        │   └── tailwind.css           # @config + @import tailwindcss + base/component layers
        │
        ├── _sections/                 # Page sections (feature-based, Multibank pattern)
        │   └── portfolio/
        │       ├── HeroSection/
        │       │   └── index.tsx
        │       ├── AboutSection/
        │       │   └── index.tsx
        │       ├── ExperienceSection/
        │       │   └── index.tsx
        │       ├── SkillsSection/
        │       │   └── index.tsx
        │       └── ContactSection/
        │           └── index.tsx
        │
        ├── components/                # Reusable UI components
        │   ├── layout/
        │   │   ├── Header/
        │   │   │   └── index.tsx
        │   │   └── Footer/
        │   │       └── index.tsx
        │   └── ui/
        │       ├── AnimatedText/
        │       │   └── index.tsx      # Typewriter character-by-character reveal
        │       ├── GlowCard/
        │       │   └── index.tsx      # Card with neon hover glow effect
        │       ├── GradientBlob/
        │       │   └── index.tsx      # Floating gradient background decoration
        │       ├── GridBackground/
        │       │   └── index.tsx      # Dot grid background pattern
        │       ├── ScrollProgress/
        │       │   └── index.tsx      # Fixed top scroll progress bar
        │       ├── Section/
        │       │   └── index.tsx      # Wrapper with section padding
        │       ├── SectionHeading/
        │       │   └── index.tsx      # Label + title + gradient underline
        │       ├── TechBadge/
        │       │   └── index.tsx      # Skill badge with brand icon
        │       ├── Terminal/
        │       │   └── index.tsx      # Terminal/code-block container
        │       └── TimelineItem/
        │           └── index.tsx      # Experience timeline entry
        │
        ├── hooks/
        │   └── useScrollSpy.ts        # Active section detection for nav
        │
        ├── models/                    # TypeScript interfaces
        │   ├── IDictionary.ts         # Master dictionary interface
        │   ├── Hero.ts                # IHeroSection
        │   ├── About.ts              # IAboutSection
        │   ├── Experience.ts          # IExperienceSection
        │   ├── Skills.ts             # ISkillsSection
        │   ├── Contact.ts            # IContactSection
        │   ├── Layout.ts             # ILayout, IHeader, IFooter
        │   └── common/
        │       └── index.ts           # Shared types: NavItem, Stat, Skill, etc.
        │
        ├── utils/
        │   ├── cn.ts                  # clsx + tailwind-merge class merger
        │   └── getBpClassName.ts      # Programmatic tablet:/desktop: prefixing
        │
        └── lib/
            └── animations.ts          # Framer Motion reusable variants
```

## Architecture Patterns

### 1. Dictionary Pattern (Text Management)

All text content is separated from components into `src/dictionaries/en.json`.

**JSON structure** — organized by section:
```json
{
  "layout": { "header": {...}, "footer": {...} },
  "hero": { "greeting": "...", "name": "...", ... },
  "about": { "sectionLabel": "...", "title": "...", "terminal": {...}, "stats": [...] },
  "experience": { "sectionLabel": "...", "title": "...", "items": [...] },
  "skills": { "sectionLabel": "...", "title": "...", "categories": [...] },
  "contact": { "sectionLabel": "...", "title": "...", "items": [...], ... }
}
```

**Loading** — `src/get-dictionary.ts`:
```ts
import type { IDictionary } from "./app/models/IDictionary";
const dictionary = import("./dictionaries/en.json").then((m) => m.default as unknown as IDictionary);
export async function getDictionary(): Promise<IDictionary> { return dictionary; }
```

**Consumption** — in `page.tsx` (server component):
```tsx
const dict = await getDictionary();
return (
  <>
    <Header {...dict.layout.header} />
    <HeroSection {...dict.hero} />
    <AboutSection {...dict.about} />
    ...
  </>
);
```

### 2. Models (Type Safety)

Master interface at `src/app/models/IDictionary.ts` imports all section interfaces:
```ts
export interface IDictionary {
  layout: ILayout;
  hero: IHeroSection;
  about: IAboutSection;
  experience: IExperienceSection;
  skills: ISkillsSection;
  contact: IContactSection;
}
```

Shared types in `src/app/models/common/index.ts`:
- `NavItem`, `SocialLink`, `ContactItem`, `Stat`
- `Skill`, `SkillCategory`, `ExperienceItem`
- `CTA`, `TerminalBlock`, `Language`, `Education`

### 3. Component Organization

**Naming:** Each component lives in its own folder with `index.tsx`:
```
components/ui/GlowCard/index.tsx    → import GlowCard from "@/app/components/ui/GlowCard"
```

**Client vs Server:**
- `page.tsx` and `layout.tsx` — **Server Components** (data fetching)
- All components in `_sections/`, `components/` — **Client Components** (`"use client"`)
- Dictionary is loaded server-side and passed as props to client components

### 4. Section Pattern

Sections receive typed props from the dictionary:
```tsx
"use client";
import type { IAboutSection } from "@/app/models/About";

export default function AboutSection(props: IAboutSection) {
  // props.sectionLabel, props.title, props.terminal, props.stats
}
```

Each section uses:
- `<Section>` wrapper for consistent padding
- `<SectionHeading>` for label + title + gradient underline
- Framer Motion `whileInView` animations with `defaultViewport`

### 5. Animations Pattern

All reusable variants in `src/app/lib/animations.ts`:
```tsx
import { fadeUp, staggerContainer, defaultViewport } from "@/app/lib/animations";

<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={defaultViewport}   // { once: true, amount: 0.3 }
  variants={staggerContainer}  // staggers children by 0.1s
>
  <motion.div variants={fadeUp}>...</motion.div>
</motion.div>
```

## Adding New Content

### New Section
1. Add text to `src/dictionaries/en.json` under a new key
2. Create interface in `src/app/models/NewSection.ts`
3. Add to `IDictionary` interface
4. Create `src/app/_sections/portfolio/NewSection/index.tsx`
5. Add to `page.tsx`: `<NewSection {...dict.newSection} />`

### New UI Component
1. Create `src/app/components/ui/ComponentName/index.tsx`
2. Mark as `"use client"` if it uses hooks, state, or Framer Motion
3. Use `cn()` for class merging, vw units for all sizing

### New Text/Content
1. Add to appropriate section in `src/dictionaries/en.json`
2. Update the corresponding model interface
3. The component receives it automatically via props spread

## Import Aliases

```ts
@/*  →  ./src/*

// Examples:
import { cn } from "@/app/utils/cn";
import { getDictionary } from "@/get-dictionary";
import type { IDictionary } from "@/app/models/IDictionary";
import { fadeUp } from "@/app/lib/animations";
```

## Key Dependencies

| Package          | Purpose                          |
|------------------|----------------------------------|
| `framer-motion`  | Scroll/view animations           |
| `react-icons`    | Brand icons (si/*) + UI (fi/*)   |
| `clsx`           | Conditional class joining        |
| `tailwind-merge` | Tailwind class conflict resolver |

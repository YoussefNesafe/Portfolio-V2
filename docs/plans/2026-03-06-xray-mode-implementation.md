# X-Ray Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an interactive design specs overlay (X-Ray mode) that shows computed CSS properties when hovering portfolio components.

**Architecture:** A React context controls X-Ray active state. A global mouseover listener finds elements with `data-xray` attributes. `getComputedStyle()` reads live CSS values, formatted into a floating tooltip card. A separate floating button toggles the mode.

**Tech Stack:** React 19 context, DOM APIs (getComputedStyle, getBoundingClientRect), Framer Motion (AnimatePresence), react-icons (FiEye)

---

### Task 1: useElementSpecs hook — pure formatting logic

**Files:**
- Create: `src/app/components/xray/hooks/useElementSpecs.ts`
- Create: `src/app/components/xray/hooks/__tests__/useElementSpecs.test.ts`

**Step 1: Write the failing tests**

```typescript
// src/app/components/xray/hooks/__tests__/useElementSpecs.test.ts
import { describe, it, expect } from "vitest";
import { rgbToHex, formatSpacing, extractSpecs } from "../useElementSpecs";

describe("rgbToHex", () => {
  it("converts rgb string to hex", () => {
    expect(rgbToHex("rgb(6, 182, 212)")).toBe("#06B6D4");
  });

  it("converts rgba string to hex", () => {
    expect(rgbToHex("rgba(168, 85, 247, 0.5)")).toBe("#A855F7");
  });

  it("returns transparent for rgba with 0 alpha", () => {
    expect(rgbToHex("rgba(0, 0, 0, 0)")).toBe("transparent");
  });

  it("passes through hex values unchanged", () => {
    expect(rgbToHex("#FF0000")).toBe("#FF0000");
  });

  it("handles empty string", () => {
    expect(rgbToHex("")).toBe("");
  });
});

describe("formatSpacing", () => {
  it("formats identical values as single value", () => {
    expect(formatSpacing("10px", "10px", "10px", "10px")).toBe("10px");
  });

  it("formats top/bottom + left/right shorthand", () => {
    expect(formatSpacing("10px", "20px", "10px", "20px")).toBe("10px 20px");
  });

  it("formats all-different values", () => {
    expect(formatSpacing("10px", "20px", "30px", "40px")).toBe("10px 20px 30px 40px");
  });

  it("returns 0 for all zeros", () => {
    expect(formatSpacing("0px", "0px", "0px", "0px")).toBe("0");
  });
});

describe("extractSpecs", () => {
  it("returns null for null element", () => {
    expect(extractSpecs(null)).toBeNull();
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/app/components/xray/hooks/__tests__/useElementSpecs.test.ts`
Expected: FAIL — module not found

**Step 3: Write the implementation**

```typescript
// src/app/components/xray/hooks/useElementSpecs.ts

export interface ElementSpecs {
  label: string;
  layout: {
    width: string;
    height: string;
    padding: string;
    margin: string;
    display: string;
    gap: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
    color: string;
  } | null;
  visual: {
    background: string;
    border: string;
    borderRadius: string;
    boxShadow: string;
  };
}

export function rgbToHex(color: string): string {
  if (!color) return "";
  if (color.startsWith("#")) return color;

  const match = color.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
  );
  if (!match) return color;

  const [, r, g, b, a] = match;
  if (a !== undefined && parseFloat(a) === 0) return "transparent";

  return (
    "#" +
    [r, g, b]
      .map((v) => parseInt(v).toString(16).padStart(2, "0").toUpperCase())
      .join("")
  );
}

export function formatSpacing(
  top: string,
  right: string,
  bottom: string,
  left: string
): string {
  const t = top || "0px";
  const r = right || "0px";
  const b = bottom || "0px";
  const l = left || "0px";

  if (t === "0px" && r === "0px" && b === "0px" && l === "0px") return "0";
  if (t === r && r === b && b === l) return t;
  if (t === b && r === l) return `${t} ${r}`;
  return `${t} ${r} ${b} ${l}`;
}

function hasTextContent(el: HTMLElement): boolean {
  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
      return true;
    }
  }
  return false;
}

export function extractSpecs(el: HTMLElement | null): ElementSpecs | null {
  if (!el) return null;

  const label = el.getAttribute("data-xray") ?? "Element";
  const s = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();

  const layout = {
    width: `${Math.round(rect.width)}px`,
    height: `${Math.round(rect.height)}px`,
    padding: formatSpacing(
      s.paddingTop,
      s.paddingRight,
      s.paddingBottom,
      s.paddingLeft
    ),
    margin: formatSpacing(
      s.marginTop,
      s.marginRight,
      s.marginBottom,
      s.marginLeft
    ),
    display: s.display,
    gap: s.gap === "normal" ? "0" : s.gap,
  };

  const typography = hasTextContent(el)
    ? {
        fontFamily: s.fontFamily.split(",")[0].replace(/['"]/g, "").trim(),
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        lineHeight: s.lineHeight,
        color: rgbToHex(s.color),
      }
    : null;

  const visual = {
    background: rgbToHex(s.backgroundColor),
    border:
      s.borderWidth === "0px"
        ? "none"
        : `${s.borderWidth} ${s.borderStyle} ${rgbToHex(s.borderColor)}`,
    borderRadius: s.borderRadius === "0px" ? "0" : s.borderRadius,
    boxShadow: s.boxShadow === "none" ? "none" : s.boxShadow,
  };

  return { label, layout, typography, visual };
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/app/components/xray/hooks/__tests__/useElementSpecs.test.ts`
Expected: PASS (all 10 tests)

**Step 5: Commit**

```bash
git add src/app/components/xray/hooks/useElementSpecs.ts src/app/components/xray/hooks/__tests__/useElementSpecs.test.ts
git commit -m "feat(xray): add useElementSpecs hook with formatting utilities"
```

---

### Task 2: XRay context and provider

**Files:**
- Create: `src/app/components/xray/XRayContext.tsx`

**Step 1: Create the context and provider**

```typescript
// src/app/components/xray/XRayContext.tsx
"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface XRayContextType {
  isActive: boolean;
  toggle: () => void;
}

const XRayContext = createContext<XRayContextType>({
  isActive: false,
  toggle: () => {},
});

export function useXRay() {
  return useContext(XRayContext);
}

export function XRayProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);

  const toggle = useCallback(() => {
    setIsActive((prev) => !prev);
  }, []);

  return (
    <XRayContext.Provider value={{ isActive, toggle }}>
      {children}
    </XRayContext.Provider>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/components/xray/XRayContext.tsx
git commit -m "feat(xray): add XRay context and provider"
```

---

### Task 3: XRay toggle button

**Files:**
- Create: `src/app/components/xray/XRayToggle.tsx`

**Step 1: Create the floating toggle button**

```typescript
// src/app/components/xray/XRayToggle.tsx
"use client";

import { useXRay } from "./XRayContext";
import { useViewMode } from "@/app/components/view-mode/ViewModeContext";
import { FiEye } from "react-icons/fi";

export default function XRayToggle() {
  const { isActive, toggle } = useXRay();
  const { mode } = useViewMode();

  if (mode === "dev") return null;

  return (
    <div className="fixed bottom-[4.267vw] tablet:bottom-[2vw] desktop:bottom-[0.833vw] right-[4.267vw] tablet:right-[2vw] desktop:right-[0.833vw] z-40">
      <button
        onClick={toggle}
        className={`flex items-center justify-center w-[10.667vw] h-[10.667vw] tablet:w-[5vw] tablet:h-[5vw] desktop:w-[2.083vw] desktop:h-[2.083vw] rounded-full bg-bg-secondary/90 backdrop-blur-lg border cursor-pointer transition-all duration-300 ${
          isActive
            ? "border-accent-cyan shadow-[0_0_12px_theme(colors.accent-cyan)] text-accent-cyan"
            : "border-border-subtle text-text-muted hover:text-accent-cyan hover:border-accent-cyan/40"
        }`}
        aria-label={`${isActive ? "Disable" : "Enable"} X-Ray mode`}
      >
        <FiEye className="w-[4.267vw] h-[4.267vw] tablet:w-[2vw] tablet:h-[2vw] desktop:w-[0.833vw] desktop:h-[0.833vw]" />
      </button>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/components/xray/XRayToggle.tsx
git commit -m "feat(xray): add floating X-Ray toggle button"
```

---

### Task 4: XRay overlay (outline + label)

**Files:**
- Create: `src/app/components/xray/XRayOverlay.tsx`

**Step 1: Create the overlay component**

```typescript
// src/app/components/xray/XRayOverlay.tsx
"use client";

interface XRayOverlayProps {
  rect: DOMRect;
  label: string;
}

export default function XRayOverlay({ rect, label }: XRayOverlayProps) {
  return (
    <div
      className="fixed pointer-events-none z-50 border border-dashed border-accent-cyan/60"
      style={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      }}
    >
      <span className="absolute -top-[5.333vw] tablet:-top-[2.5vw] desktop:-top-[1.042vw] left-0 bg-accent-cyan/90 text-background text-[2.667vw] tablet:text-[1.25vw] desktop:text-[0.521vw] font-mono px-[1.6vw] tablet:px-[0.75vw] desktop:px-[0.313vw] py-[0.533vw] tablet:py-[0.25vw] desktop:py-[0.104vw] rounded-[0.533vw] tablet:rounded-[0.25vw] desktop:rounded-[0.104vw] whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/components/xray/XRayOverlay.tsx
git commit -m "feat(xray): add overlay outline and label component"
```

---

### Task 5: XRay tooltip (specs display)

**Files:**
- Create: `src/app/components/xray/XRayTooltip.tsx`

**Step 1: Create the tooltip component**

```typescript
// src/app/components/xray/XRayTooltip.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ElementSpecs } from "./hooks/useElementSpecs";

interface XRayTooltipProps {
  specs: ElementSpecs | null;
  mouseX: number;
  mouseY: number;
}

function ColorSwatch({ color }: { color: string }) {
  if (!color || color === "transparent" || color === "none") return null;
  return (
    <span
      className="inline-block w-[2.667vw] h-[2.667vw] tablet:w-[1.25vw] tablet:h-[1.25vw] desktop:w-[0.521vw] desktop:h-[0.521vw] rounded-[0.267vw] tablet:rounded-[0.125vw] desktop:rounded-[0.052vw] border border-border-subtle align-middle ml-[1.067vw] tablet:ml-[0.5vw] desktop:ml-[0.208vw]"
      style={{ backgroundColor: color }}
    />
  );
}

function SpecRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between gap-[2.667vw] tablet:gap-[1.25vw] desktop:gap-[0.521vw]">
      <span className="text-text-muted">{label}</span>
      <span className="text-foreground">
        {value}
        {color && <ColorSwatch color={color} />}
      </span>
    </div>
  );
}

function SpecGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-[2.133vw] tablet:mb-[1vw] desktop:mb-[0.417vw] last:mb-0">
      <div className="text-accent-cyan font-semibold mb-[1.067vw] tablet:mb-[0.5vw] desktop:mb-[0.208vw] text-[2.667vw] tablet:text-[1.25vw] desktop:text-[0.521vw]">
        {title}
      </div>
      <div className="flex flex-col gap-[0.533vw] tablet:gap-[0.25vw] desktop:gap-[0.104vw] text-[2.4vw] tablet:text-[1.125vw] desktop:text-[0.469vw]">
        {children}
      </div>
    </div>
  );
}

export default function XRayTooltip({ specs, mouseX, mouseY }: XRayTooltipProps) {
  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1440;
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 900;
  const tooltipW = 300;
  const tooltipH = 350;
  const offset = 16;

  const left = mouseX + tooltipW + offset > viewportW
    ? mouseX - tooltipW - offset
    : mouseX + offset;
  const top = mouseY + tooltipH + offset > viewportH
    ? Math.max(8, mouseY - tooltipH)
    : mouseY + offset;

  return (
    <AnimatePresence>
      {specs && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.12 }}
          className="fixed z-[60] pointer-events-none bg-bg-secondary/95 backdrop-blur-lg border border-border-subtle rounded-[1.6vw] tablet:rounded-[0.75vw] desktop:rounded-[0.313vw] px-[3.2vw] py-[2.667vw] tablet:px-[1.5vw] tablet:py-[1.25vw] desktop:px-[0.625vw] desktop:py-[0.521vw] font-mono shadow-xl max-w-[80vw] tablet:max-w-[40vw] desktop:max-w-[15.625vw]"
          style={{ left, top }}
        >
          <SpecGroup title="Layout">
            <SpecRow label="size" value={`${specs.layout.width} × ${specs.layout.height}`} />
            <SpecRow label="padding" value={specs.layout.padding} />
            <SpecRow label="margin" value={specs.layout.margin} />
            <SpecRow label="display" value={specs.layout.display} />
            {specs.layout.gap !== "0" && (
              <SpecRow label="gap" value={specs.layout.gap} />
            )}
          </SpecGroup>

          {specs.typography && (
            <SpecGroup title="Typography">
              <SpecRow label="font" value={specs.typography.fontFamily} />
              <SpecRow label="size" value={specs.typography.fontSize} />
              <SpecRow label="weight" value={specs.typography.fontWeight} />
              <SpecRow label="line-height" value={specs.typography.lineHeight} />
              <SpecRow label="color" value={specs.typography.color} color={specs.typography.color} />
            </SpecGroup>
          )}

          <SpecGroup title="Visual">
            <SpecRow label="background" value={specs.visual.background} color={specs.visual.background} />
            <SpecRow label="border" value={specs.visual.border} />
            {specs.visual.borderRadius !== "0" && (
              <SpecRow label="radius" value={specs.visual.borderRadius} />
            )}
            {specs.visual.boxShadow !== "none" && (
              <SpecRow label="shadow" value="present" />
            )}
          </SpecGroup>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/components/xray/XRayTooltip.tsx
git commit -m "feat(xray): add specs tooltip with layout, typography, and visual groups"
```

---

### Task 6: XRay inspector (global mouse listener + composition)

**Files:**
- Create: `src/app/components/xray/XRayInspector.tsx`
- Create: `src/app/components/xray/index.ts`

**Step 1: Create the inspector component that wires everything together**

```typescript
// src/app/components/xray/XRayInspector.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useXRay } from "./XRayContext";
import XRayOverlay from "./XRayOverlay";
import XRayTooltip from "./XRayTooltip";
import { extractSpecs, type ElementSpecs } from "./hooks/useElementSpecs";

function findXRayTarget(el: HTMLElement | null): HTMLElement | null {
  let current = el;
  while (current) {
    if (current.hasAttribute("data-xray")) return current;
    current = current.parentElement;
  }
  return null;
}

export default function XRayInspector() {
  const { isActive } = useXRay();
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [specs, setSpecs] = useState<ElementSpecs | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isActive) return;
      setMouse({ x: e.clientX, y: e.clientY });

      const xrayTarget = findXRayTarget(e.target as HTMLElement);
      if (xrayTarget !== target) {
        setTarget(xrayTarget);
        setSpecs(extractSpecs(xrayTarget));
      }
    },
    [isActive, target]
  );

  const handleMouseLeave = useCallback(() => {
    setTarget(null);
    setSpecs(null);
  }, []);

  useEffect(() => {
    if (!isActive) {
      setTarget(null);
      setSpecs(null);
      return;
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isActive, handleMouseMove, handleMouseLeave]);

  if (!isActive || !target) return null;

  const rect = target.getBoundingClientRect();

  return (
    <>
      <XRayOverlay rect={rect} label={target.getAttribute("data-xray") ?? "Element"} />
      <XRayTooltip specs={specs} mouseX={mouse.x} mouseY={mouse.y} />
    </>
  );
}
```

```typescript
// src/app/components/xray/index.ts
export { XRayProvider, useXRay } from "./XRayContext";
export { default as XRayToggle } from "./XRayToggle";
export { default as XRayInspector } from "./XRayInspector";
```

**Step 2: Commit**

```bash
git add src/app/components/xray/XRayInspector.tsx src/app/components/xray/index.ts
git commit -m "feat(xray): add inspector with global mouse listener and barrel export"
```

---

### Task 7: Integrate into HomeContent and layout

**Files:**
- Modify: `src/app/(public)/HomeContent.tsx`

**Step 1: Wrap with XRayProvider and add XRayInspector + XRayToggle**

Update `src/app/(public)/HomeContent.tsx` to:

```typescript
"use client";

import { useViewMode } from "@/app/components/view-mode/ViewModeContext";
import { useEasterEggs } from "@/app/components/easter-eggs/EasterEggsContext";
import InteractiveTerminal from "@/app/components/view-mode/InteractiveTerminal";
import { XRayProvider, XRayToggle, XRayInspector } from "@/app/components/xray";
import type { IDictionary } from "@/app/models/IDictionary";

interface HomeContentProps {
  dict: Pick<
    IDictionary,
    "hero" | "about" | "experience" | "projects" | "skills" | "contact"
  >;
  designerContent: React.ReactNode;
}

export default function HomeContent({
  dict,
  designerContent,
}: HomeContentProps) {
  const { mode } = useViewMode();
  const { triggerMatrix } = useEasterEggs();

  if (mode === "dev") {
    return (
      <InteractiveTerminal dict={dict} onTriggerMatrix={triggerMatrix} />
    );
  }

  return (
    <XRayProvider>
      {designerContent}
      <XRayToggle />
      <XRayInspector />
    </XRayProvider>
  );
}
```

**Step 2: Run dev server and verify the eye button appears**

Run: `npm run dev`
Check: Visit `http://localhost:3000`, eye button visible bottom-right

**Step 3: Commit**

```bash
git add src/app/(public)/HomeContent.tsx
git commit -m "feat(xray): integrate XRay provider, toggle, and inspector into HomeContent"
```

---

### Task 8: Add data-xray attributes to sections

**Files:**
- Modify: `src/app/components/ui/Section/index.tsx`

**Step 1: Add data-xray attribute using the section id**

In `src/app/components/ui/Section/index.tsx`, add `data-xray` to the `<section>` element. Map the id to a display name:

```typescript
"use client";

import { cn } from "@/app/utils/cn";
import { HTMLAttributes } from "react";
import SectionDecorations from "@/app/components/ui/FloatingElements";

const sectionLabels: Record<string, string> = {
  hero: "HeroSection",
  about: "AboutSection",
  experience: "ExperienceSection",
  projects: "ProjectsSection",
  skills: "SkillsSection",
  contact: "ContactSection",
};

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  id?: string;
}

export default function Section({
  children,
  id,
  className,
  ...props
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn("relative section-pt section-pb", className)}
      data-xray={id ? sectionLabels[id] ?? id : undefined}
      {...props}
    >
      {children}
      {id ? <SectionDecorations variant={id} /> : null}
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/components/ui/Section/index.tsx
git commit -m "feat(xray): add data-xray attributes to Section component"
```

---

### Task 9: Add data-xray attributes to child components

**Files:**
- Modify: `src/app/components/ui/SectionHeading/index.tsx`
- Modify: `src/app/components/ui/GlowCard/index.tsx`
- Modify: `src/app/components/ui/TechBadge/index.tsx`
- Modify: `src/app/components/ui/TimelineItem/index.tsx`
- Modify: `src/app/_sections/portfolio/ProjectsSection/ProjectCard.tsx`

**Step 1: Add `data-xray` to each component's outermost element**

For each file, add the `data-xray` attribute to the top-level element:

**SectionHeading** (`src/app/components/ui/SectionHeading/index.tsx`):
Add `data-xray="SectionHeading"` to the outer `<motion.div>`.

**GlowCard** (`src/app/components/ui/GlowCard/index.tsx`):
Add `data-xray="GlowCard"` to the outer `<div>`.

**TechBadge** (`src/app/components/ui/TechBadge/index.tsx`):
Add `data-xray="TechBadge"` to the outer `<motion.div>`.

**TimelineItem** (`src/app/components/ui/TimelineItem/index.tsx`):
Add `data-xray="TimelineItem"` to the outer `<div>`.

**ProjectCard** (`src/app/_sections/portfolio/ProjectsSection/ProjectCard.tsx`):
Add `data-xray="ProjectCard"` to the outer `<motion.div>`.

**Step 2: Run all tests to verify nothing breaks**

Run: `npm test`
Expected: All tests pass (258+)

**Step 3: Commit**

```bash
git add src/app/components/ui/SectionHeading/index.tsx src/app/components/ui/GlowCard/index.tsx src/app/components/ui/TechBadge/index.tsx src/app/components/ui/TimelineItem/index.tsx src/app/_sections/portfolio/ProjectsSection/ProjectCard.tsx
git commit -m "feat(xray): add data-xray attributes to inspectable child components"
```

---

### Task 10: Visual verification with Playwright

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Take screenshots to verify**

Using Playwright MCP:
1. Navigate to `http://localhost:3000`
2. Click the X-Ray eye button
3. Hover over the About section — verify outline + label + tooltip appear
4. Hover over a project card — verify component-level inspection works
5. Hover near the right edge — verify tooltip flips position
6. Toggle dev mode — verify X-Ray button is hidden

**Step 3: Fix any visual issues found**

Adjust positioning, spacing, or styling as needed based on screenshots.

**Step 4: Run all tests one final time**

Run: `npm test`
Expected: All tests pass

**Step 5: Commit any visual fixes**

```bash
git add -A
git commit -m "style(xray): polish overlay and tooltip positioning"
```

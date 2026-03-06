# Custom Cursor Effects Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a glowing dot follower + spotlight radial gradient that tracks the cursor, changing color per section. Desktop only.

**Architecture:** A `useMousePosition` hook tracks the mouse via `requestAnimationFrame`-throttled `mousemove`, detects the active section via `document.elementsFromPoint()`, and returns position + color. A `CustomCursor` component renders two fixed divs (dot + spotlight) positioned via refs and inline styles — no React re-renders per frame. Hidden on mobile/tablet and in dev mode.

**Tech Stack:** React 19 refs + useEffect, DOM APIs (elementsFromPoint, matchMedia, requestAnimationFrame), CSS transforms + custom properties

---

### Task 1: useMousePosition hook with tests

**Files:**
- Create: `src/app/components/cursor/useMousePosition.ts`
- Create: `src/app/components/cursor/__tests__/useMousePosition.test.ts`

**Step 1: Write the failing tests**

```typescript
// src/app/components/cursor/__tests__/useMousePosition.test.ts
import { describe, it, expect } from "vitest";
import { getSectionColor, SECTION_COLORS, DEFAULT_COLOR } from "../useMousePosition";

describe("getSectionColor", () => {
  it("returns cyan for hero section", () => {
    expect(getSectionColor("hero")).toBe(SECTION_COLORS.hero);
  });

  it("returns purple for about section", () => {
    expect(getSectionColor("about")).toBe(SECTION_COLORS.about);
  });

  it("returns purple for experience section", () => {
    expect(getSectionColor("experience")).toBe(SECTION_COLORS.experience);
  });

  it("returns emerald for projects section", () => {
    expect(getSectionColor("projects")).toBe(SECTION_COLORS.projects);
  });

  it("returns cyan for skills section", () => {
    expect(getSectionColor("skills")).toBe(SECTION_COLORS.skills);
  });

  it("returns emerald for contact section", () => {
    expect(getSectionColor("contact")).toBe(SECTION_COLORS.contact);
  });

  it("returns default color for unknown section", () => {
    expect(getSectionColor("unknown")).toBe(DEFAULT_COLOR);
  });

  it("returns default color for null", () => {
    expect(getSectionColor(null)).toBe(DEFAULT_COLOR);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/app/components/cursor/__tests__/useMousePosition.test.ts`
Expected: FAIL — module not found

**Step 3: Write the implementation**

```typescript
// src/app/components/cursor/useMousePosition.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export const SECTION_COLORS: Record<string, string> = {
  hero: "#06B6D4",
  about: "#A855F7",
  experience: "#A855F7",
  projects: "#10B981",
  skills: "#06B6D4",
  contact: "#10B981",
};

export const DEFAULT_COLOR = "#06B6D4";

export function getSectionColor(sectionId: string | null): string {
  if (!sectionId) return DEFAULT_COLOR;
  return SECTION_COLORS[sectionId] ?? DEFAULT_COLOR;
}

function findSectionId(x: number, y: number): string | null {
  const elements = document.elementsFromPoint(x, y);
  for (const el of elements) {
    if (el.tagName === "SECTION" && el.id) {
      return el.id;
    }
  }
  return null;
}

interface MouseState {
  x: number;
  y: number;
  color: string;
  isVisible: boolean;
}

export function useMousePosition(): MouseState {
  const [isDesktop, setIsDesktop] = useState(false);
  const stateRef = useRef<MouseState>({
    x: 0,
    y: 0,
    color: DEFAULT_COLOR,
    isVisible: false,
  });
  const [state, setState] = useState<MouseState>(stateRef.current);
  const rafRef = useRef<number>(0);

  const updateState = useCallback(() => {
    setState({ ...stateRef.current });
    rafRef.current = 0;
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const handleMouseMove = (e: MouseEvent) => {
      stateRef.current.x = e.clientX;
      stateRef.current.y = e.clientY;
      stateRef.current.isVisible = true;

      const sectionId = findSectionId(e.clientX, e.clientY);
      stateRef.current.color = getSectionColor(sectionId);

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(updateState);
      }
    };

    const handleMouseLeave = () => {
      stateRef.current.isVisible = false;
      setState({ ...stateRef.current });
    };

    const handleMouseEnter = () => {
      stateRef.current.isVisible = true;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isDesktop, updateState]);

  if (!isDesktop) {
    return { x: 0, y: 0, color: DEFAULT_COLOR, isVisible: false };
  }

  return state;
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/app/components/cursor/__tests__/useMousePosition.test.ts`
Expected: PASS (all 8 tests)

**Step 5: Commit**

```bash
git add src/app/components/cursor/useMousePosition.ts src/app/components/cursor/__tests__/useMousePosition.test.ts
git commit -m "feat(cursor): add useMousePosition hook with section color mapping"
```

---

### Task 2: CustomCursor component — dot + spotlight

**Files:**
- Create: `src/app/components/cursor/CustomCursor.tsx`

**Step 1: Create the component**

```typescript
// src/app/components/cursor/CustomCursor.tsx
"use client";

import { useEffect, useRef } from "react";
import { useMousePosition } from "./useMousePosition";
import { useViewMode } from "@/app/components/view-mode/ViewModeContext";

export default function CustomCursor() {
  const { x, y, color, isVisible } = useMousePosition();
  const { mode } = useViewMode();
  const dotRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  // Hide native cursor on mount (desktop only)
  useEffect(() => {
    if (mode === "dev") return;

    const mq = window.matchMedia("(min-width: 1024px)");
    if (!mq.matches) return;

    document.body.classList.add("cursor-none");
    return () => {
      document.body.classList.remove("cursor-none");
    };
  }, [mode]);

  // Update dot position via ref (no re-render needed for transform)
  useEffect(() => {
    if (dotRef.current) {
      dotRef.current.style.transform = `translate3d(${x - 4}px, ${y - 4}px, 0)`;
      dotRef.current.style.opacity = isVisible ? "1" : "0";
      dotRef.current.style.backgroundColor = color;
      dotRef.current.style.boxShadow = isVisible
        ? `0 0 12px ${color}, 0 0 4px ${color}`
        : "none";
    }
  }, [x, y, color, isVisible]);

  // Update spotlight via ref
  useEffect(() => {
    if (spotlightRef.current) {
      spotlightRef.current.style.background = isVisible
        ? `radial-gradient(circle 200px at ${x}px ${y}px, ${color}10 0%, transparent 100%)`
        : "none";
    }
  }, [x, y, color, isVisible]);

  if (mode === "dev") return null;

  return (
    <>
      {/* Spotlight — behind content */}
      <div
        ref={spotlightRef}
        className="fixed inset-0 z-[1] pointer-events-none hidden desktop:block"
        aria-hidden="true"
      />
      {/* Dot — above content */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-50 pointer-events-none hidden desktop:block w-[8px] h-[8px] rounded-full opacity-0 will-change-transform"
        style={{ transition: "transform 80ms ease-out, opacity 300ms ease, background-color 300ms ease, box-shadow 300ms ease" }}
        aria-hidden="true"
      />
    </>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/components/cursor/CustomCursor.tsx
git commit -m "feat(cursor): add CustomCursor component with dot and spotlight"
```

---

### Task 3: Add cursor-none CSS class

**Files:**
- Modify: `src/app/styles/tailwind.css`

**Step 1: Add the cursor-none class to the base layer**

Add this rule inside the `@layer base` block, after the scrollbar styles (after line 59):

```css
  body.cursor-none,
  body.cursor-none * {
    cursor: none !important;
  }
```

**Step 2: Commit**

```bash
git add src/app/styles/tailwind.css
git commit -m "feat(cursor): add cursor-none body class for hiding native cursor"
```

---

### Task 4: Integrate CustomCursor into HomeContent

**Files:**
- Modify: `src/app/(public)/HomeContent.tsx`

**Step 1: Add CustomCursor import and render**

Current file at `src/app/(public)/HomeContent.tsx`:
```typescript
"use client";

import { useViewMode } from "@/app/components/view-mode/ViewModeContext";
import { useEasterEggs } from "@/app/components/easter-eggs/EasterEggsContext";
import InteractiveTerminal from "@/app/components/view-mode/InteractiveTerminal";
import { XRayProvider, XRayToggle, XRayInspector } from "@/app/components/xray";
import type { IDictionary } from "@/app/models/IDictionary";
```

Add import:
```typescript
import CustomCursor from "@/app/components/cursor/CustomCursor";
```

Change the return block from:
```typescript
  return (
    <XRayProvider>
      {designerContent}
      <XRayToggle />
      <XRayInspector />
    </XRayProvider>
  );
```

To:
```typescript
  return (
    <XRayProvider>
      {designerContent}
      <XRayToggle />
      <XRayInspector />
      <CustomCursor />
    </XRayProvider>
  );
```

**Step 2: Run all tests to verify nothing breaks**

Run: `npm test`
Expected: All tests pass (268+)

**Step 3: Commit**

```bash
git add "src/app/(public)/HomeContent.tsx"
git commit -m "feat(cursor): integrate CustomCursor into HomeContent"
```

---

### Task 5: Visual verification with Playwright

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Verify using Playwright MCP**

1. Navigate to `http://localhost:3000`
2. Take screenshot — verify no custom cursor visible (Playwright doesn't trigger mousemove)
3. Check that the dot and spotlight divs exist in the DOM (via snapshot)
4. Verify dev mode hides cursor: switch to dev mode, check dot/spotlight divs are gone
5. Switch back to designer mode, verify divs reappear

**Step 3: Manual spot-check list**

Since cursor effects require real mouse movement, document these for manual testing:
- [ ] Dot follows mouse with slight trailing delay
- [ ] Spotlight glow visible on dark background
- [ ] Color changes when moving between sections
- [ ] Dot fades out when cursor leaves viewport
- [ ] Native cursor is hidden
- [ ] Dev mode: no custom cursor, native cursor returns
- [ ] Mobile viewport: no custom cursor

**Step 4: Run all tests one final time**

Run: `npm test`
Expected: All tests pass

**Step 5: Commit any visual fixes if needed**

```bash
git add -A
git commit -m "style(cursor): polish dot and spotlight effects"
```

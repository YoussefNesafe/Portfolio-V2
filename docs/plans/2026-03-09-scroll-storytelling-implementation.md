# Scroll Storytelling & Performance Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the portfolio homepage from static fade-in sections into a scroll-driven visual journey with parallax depth, text reveals, magnetic cursor, and performance/UX fixes.

**Architecture:** New custom hooks (`useParallax`, `useMagneticElement`) built on Framer Motion's `useScroll`/`useTransform`. New reusable components (`SplitText`, `SectionDivider`, `TypewriterText`). All animations GPU-only (transform + opacity). Parallax disabled on mobile via media query. `useReducedMotion` respected throughout.

**Tech Stack:** Framer Motion 12 (`useScroll`, `useTransform`, `useSpring`, `useReducedMotion`), React 19, TypeScript 5, Tailwind CSS 4.

---

## Task 1: Parallax Hook — `useParallax`

**Files:**
- Create: `src/app/hooks/useParallax.ts`

**Step 1: Create the hook**

```typescript
"use client";

import { useScroll, useTransform, useSpring, useReducedMotion, type MotionValue } from "framer-motion";
import { useRef } from "react";

interface UseParallaxOptions {
  speed?: number;        // Multiplier: 0.3 = slow, 1 = normal, -0.5 = reverse
  offset?: [string, string]; // Scroll range, default ["start end", "end start"]
  springConfig?: { stiffness?: number; damping?: number };
}

interface UseParallaxReturn {
  ref: React.RefObject<HTMLDivElement | null>;
  y: MotionValue<number>;
}

export function useParallax({
  speed = 0.5,
  offset = ["start end", "end start"],
  springConfig = { stiffness: 100, damping: 30 },
}: UseParallaxOptions = {}): UseParallaxReturn {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset,
  });

  const range = speed * 100;
  const rawY = useTransform(scrollYProgress, [0, 1], [range, -range]);
  const y = useSpring(rawY, springConfig);

  // Return static 0 if user prefers reduced motion
  const zeroY = useTransform(() => 0);

  return {
    ref,
    y: prefersReducedMotion ? zeroY : y,
  };
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors related to useParallax.

**Step 3: Commit**

```bash
git add src/app/hooks/useParallax.ts
git commit -m "feat: add useParallax hook for scroll-linked parallax effects"
```

---

## Task 2: Magnetic Element Hook — `useMagneticElement`

**Files:**
- Create: `src/app/hooks/useMagneticElement.ts`

**Step 1: Create the hook**

```typescript
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

interface UseMagneticOptions {
  strength?: number;  // Pull strength in pixels, default 10
  radius?: number;    // Activation radius in pixels, default 50
}

interface MagneticTransform {
  x: number;
  y: number;
}

export function useMagneticElement({
  strength = 10,
  radius = 50,
}: UseMagneticOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [transform, setTransform] = useState<MagneticTransform>({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (prefersReducedMotion || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance < radius) {
        const pull = (1 - distance / radius) * strength;
        setTransform({
          x: (distX / distance) * pull || 0,
          y: (distY / distance) * pull || 0,
        });
      } else {
        setTransform({ x: 0, y: 0 });
      }
    },
    [prefersReducedMotion, strength, radius]
  );

  const handleMouseLeave = useCallback(() => {
    setTransform({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave, prefersReducedMotion]);

  return {
    ref,
    style: {
      transform: `translate(${transform.x}px, ${transform.y}px)`,
      transition: "transform 0.3s cubic-bezier(0.33, 1, 0.68, 1)",
    },
  };
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add src/app/hooks/useMagneticElement.ts
git commit -m "feat: add useMagneticElement hook for magnetic cursor pull effect"
```

---

## Task 3: 3D Tilt Hook — `useTilt`

**Files:**
- Create: `src/app/hooks/useTilt.ts`

**Step 1: Create the hook**

```typescript
"use client";

import { useRef, useCallback, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface UseTiltOptions {
  maxTilt?: number;      // Max rotation degrees, default 8
  perspective?: number;  // CSS perspective in px, default 1000
  scale?: number;        // Scale on hover, default 1.02
}

export function useTilt({
  maxTilt = 8,
  perspective = 1000,
  scale = 1.02,
}: UseTiltOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [style, setStyle] = useState({
    transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`,
    transition: "transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)",
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (prefersReducedMotion || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      setStyle({
        transform: `perspective(${perspective}px) rotateX(${-y * maxTilt}deg) rotateY(${x * maxTilt}deg) scale(${scale})`,
        transition: "transform 0.1s ease-out",
      });
    },
    [prefersReducedMotion, maxTilt, perspective, scale]
  );

  const handleMouseLeave = useCallback(() => {
    setStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`,
      transition: "transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)",
    });
  }, [perspective]);

  return {
    ref,
    style: prefersReducedMotion ? {} : style,
    handlers: prefersReducedMotion
      ? {}
      : {
          onMouseMove: handleMouseMove,
          onMouseLeave: handleMouseLeave,
        },
  };
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add src/app/hooks/useTilt.ts
git commit -m "feat: add useTilt hook for 3D perspective tilt on hover"
```

---

## Task 4: SplitText Component

**Files:**
- Create: `src/app/components/ui/SplitText/index.tsx`

**Step 1: Create the component**

This component splits text into words and animates each word's entry using scroll progress.

```typescript
"use client";

import { motion, useReducedMotion } from "framer-motion";

interface SplitTextProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
}

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.5,
      ease: [0.33, 1, 0.68, 1],
    },
  }),
};

export default function SplitText({
  children,
  className,
  as: Tag = "span",
  delay = 0,
}: SplitTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const words = children.split(" ");

  if (prefersReducedMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          custom={i + delay}
          variants={wordVariants}
          className="inline-block mr-[1.067vw] tablet:mr-[0.5vw] desktop:mr-[0.208vw]"
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add src/app/components/ui/SplitText/index.tsx
git commit -m "feat: add SplitText component for word-by-word scroll reveal"
```

---

## Task 5: Section Divider Component

**Files:**
- Create: `src/app/components/ui/SectionDivider/index.tsx`

**Step 1: Create the component**

A flowing gradient line that connects sections visually.

```typescript
export default function SectionDivider() {
  return (
    <div className="relative w-full py-[4vw] tablet:py-[2vw] desktop:py-[1vw] overflow-hidden">
      <div className="relative h-[0.267vw] tablet:h-[0.125vw] desktop:h-[0.052vw] w-full">
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-cyan/40 to-transparent"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 30%, black 70%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 30%, black 70%, transparent)",
          }}
        />
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/components/ui/SectionDivider/index.tsx
git commit -m "feat: add SectionDivider component for visual section flow"
```

---

## Task 6: TypewriterText Component

**Files:**
- Create: `src/app/components/ui/TypewriterText/index.tsx`

**Step 1: Create the component**

A scroll-triggered typewriter that types text character by character when visible.

```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface TypewriterTextProps {
  lines: { text: string; className?: string }[];
  speed?: number;        // ms per character
  lineDelay?: number;    // ms between lines
}

export default function TypewriterText({
  lines,
  speed = 20,
  lineDelay = 200,
}: TypewriterTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();
  const [visibleChars, setVisibleChars] = useState(0);

  const totalChars = lines.reduce((sum, line) => sum + line.text.length, 0);
  const totalWithDelays = totalChars + lines.length * Math.ceil(lineDelay / speed);

  useEffect(() => {
    if (!isInView || prefersReducedMotion) {
      if (prefersReducedMotion) setVisibleChars(totalWithDelays);
      return;
    }

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setVisibleChars(current);
      if (current >= totalWithDelays) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [isInView, prefersReducedMotion, speed, totalWithDelays]);

  // Calculate which characters to show
  let charCount = 0;
  const renderedLines = lines.map((line, lineIndex) => {
    const lineStart = charCount;
    charCount += line.text.length + Math.ceil(lineDelay / speed);

    const delayChars = lineIndex * Math.ceil(lineDelay / speed);
    const adjustedVisible = visibleChars - delayChars;
    const charsToShow = Math.max(0, Math.min(line.text.length, adjustedVisible - lineStart + delayChars));

    return {
      ...line,
      displayText: line.text.slice(0, charsToShow),
      isComplete: charsToShow >= line.text.length,
      hasStarted: charsToShow > 0,
    };
  });

  return (
    <div ref={ref}>
      {renderedLines.map((line, i) => (
        <p key={i} className={line.className}>
          {line.displayText}
          {line.hasStarted && !line.isComplete && (
            <span className="animate-blink-cursor text-accent-cyan">|</span>
          )}
        </p>
      ))}
      {renderedLines.every((l) => l.isComplete) && (
        <span className="animate-blink-cursor text-accent-cyan">_</span>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/components/ui/TypewriterText/index.tsx
git commit -m "feat: add TypewriterText component for scroll-triggered typing effect"
```

---

## Task 7: Lazy Load InteractiveTerminal

**Files:**
- Modify: `src/app/(public)/HomeContent.tsx`

**Step 1: Replace static import with dynamic import**

Change the import at the top of `HomeContent.tsx`:

Replace:
```typescript
import InteractiveTerminal from "@/app/components/view-mode/InteractiveTerminal";
```

With:
```typescript
import dynamic from "next/dynamic";

const InteractiveTerminal = dynamic(
  () => import("@/app/components/view-mode/InteractiveTerminal"),
  { ssr: false }
);
```

**Step 2: Verify dev server works**

Run: `npm run dev`
Test: Toggle to Dev mode — terminal should still render correctly.

**Step 3: Commit**

```bash
git add src/app/(public)/HomeContent.tsx
git commit -m "perf: lazy load InteractiveTerminal with next/dynamic"
```

---

## Task 8: Focus Indicators + Skip Link

**Files:**
- Modify: `src/app/styles/tailwind.css`
- Modify: `src/app/layout.tsx`

**Step 1: Add global focus-visible styles to tailwind.css**

Add inside `@layer base` block, after the `body` rule:

```css
/* Keyboard focus indicators */
*:focus-visible {
  outline: 2px solid #06B6D4;
  outline-offset: 2px;
  border-radius: 0.26vw;
}

/* Skip to main content link */
.skip-link {
  position: fixed;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 0.5rem 1rem;
  background: #06B6D4;
  color: #0A0A0F;
  font-weight: 600;
  border-radius: 0 0 0.5rem 0.5rem;
  transition: top 0.2s;
}

.skip-link:focus {
  top: 0;
}
```

**Step 2: Add skip link to root layout**

In `src/app/layout.tsx`, add inside `<body>` as the first child:

```tsx
<a href="#hero" className="skip-link">
  Skip to main content
</a>
```

**Step 3: Verify it works**

Run: `npm run dev`
Test: Press Tab on page load — skip link should appear at top.

**Step 4: Commit**

```bash
git add src/app/styles/tailwind.css src/app/layout.tsx
git commit -m "a11y: add keyboard focus indicators and skip-to-content link"
```

---

## Task 9: Hero Section — Parallax + Scroll-Linked Indicator

**Files:**
- Modify: `src/app/_sections/portfolio/HeroSection/index.tsx`

**Step 1: Add parallax to blobs and scroll-linked fade for scroll indicator**

Replace the entire `HeroSection` component with:

```typescript
"use client";

import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { FiLinkedin, FiMail, FiChevronDown } from "react-icons/fi";
import {
  staggerContainer,
  defaultViewport,
} from "@/app/lib/animations";
import type { IHeroSection } from "@/app/models/Hero";
import AnimatedText from "@/app/components/ui/AnimatedText";
import GridBackground from "@/app/components/ui/GridBackground";
import GradientBlob from "@/app/components/ui/GradientBlob";
import SectionDecorations from "@/app/components/ui/FloatingElements";
import SplitText from "@/app/components/ui/SplitText";
import { useParallax } from "@/app/hooks/useParallax";

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.5,
      ease: [0.33, 1, 0.68, 1],
    },
  }),
};

export default function HeroSection(props: IHeroSection) {
  const [typewriterDone, setTypewriterDone] = useState(false);

  // Parallax for blobs
  const blobSlow = useParallax({ speed: 0.3 });
  const blobMedium = useParallax({ speed: 0.15 });

  // Scroll-linked fade out for scroll indicator
  const { scrollYProgress } = useScroll();
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const scrollIndicatorY = useTransform(scrollYProgress, [0, 0.08], [0, 30]);

  return (
    <section
      id="hero"
      ref={blobSlow.ref}
      className="relative min-h-screen flex items-center justify-center overflow-x-clip"
    >
      <GridBackground />
      <motion.div style={{ y: blobSlow.y }}>
        <GradientBlob
          color="cyan"
          className="-top-[20vw] -right-[20vw] tablet:-top-[10vw] tablet:-right-[10vw] desktop:-top-[5.208vw] desktop:-right-[5.208vw] animate-wave-glow"
        />
      </motion.div>
      <motion.div style={{ y: blobMedium.y }}>
        <GradientBlob
          color="purple"
          className="-bottom-[20vw] -left-[20vw] tablet:-bottom-[10vw] tablet:-left-[10vw] desktop:-bottom-[5.208vw] desktop:-left-[5.208vw] animate-wave-glow"
        />
      </motion.div>
      <SectionDecorations variant="hero" />

      {/* Content */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        variants={staggerContainer}
        className="relative z-10 flex flex-col items-center text-center pt-[20vw] tablet:pt-0 px-[2.67vw] tablet:px-[5vw] desktop:px-[14.063vw]"
      >
        {/* Typewriter greeting */}
        <motion.div
          variants={wordVariants}
          custom={0}
          className="mb-[4.267vw] tablet:mb-[2vw] desktop:mb-[0.833vw]"
        >
          <div className="font-mono text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] text-accent-emerald bg-bg-secondary/80 inline-block px-[3vw] py-[2.133vw] tablet:px-[2vw] tablet:py-[1vw] desktop:px-[0.833vw] desktop:py-[0.417vw] rounded-[1.333vw] tablet:rounded-[0.625vw] desktop:rounded-[0.26vw] border border-border-subtle">
            <AnimatedText
              text={props.greeting}
              speed={40}
              onComplete={() => setTypewriterDone(true)}
            />
          </div>
        </motion.div>

        {/* Name — word-by-word reveal */}
        <motion.div
          initial="hidden"
          animate={typewriterDone ? "visible" : "hidden"}
        >
          <SplitText
            as="h1"
            className="text-[13.333vw] tablet:text-[7.5vw] desktop:text-[3.646vw] font-bold text-text-heading"
          >
            {props.name}
          </SplitText>
        </motion.div>

        {/* Title */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={typewriterDone ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
          className="text-[6.4vw] tablet:text-[3vw] desktop:text-[1.458vw] text-text-muted font-medium mt-[2.667vw] tablet:mt-[1.25vw] desktop:mt-[0.521vw]"
        >
          {props.titlePrefix}{" "}
          <span className="gradient-text font-bold">
            {props.titleHighlight}
          </span>{" "}
          {props.titleSuffix}
        </motion.p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={typewriterDone ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.33, 1, 0.68, 1] }}
          className="text-[4.267vw] tablet:text-[2vw] desktop:text-[0.833vw] text-text-muted max-w-[160vw] tablet:max-w-[75vw] desktop:max-w-[31.25vw] mt-[4.267vw] tablet:mt-[2vw] desktop:mt-[0.833vw]"
        >
          {props.tagline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={typewriterDone ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.33, 1, 0.68, 1] }}
          className="flex flex-col tablet:flex-row gap-[3.2vw] tablet:gap-[1.5vw] desktop:gap-[0.625vw] mt-[8.533vw] tablet:mt-[4vw] desktop:mt-[1.667vw]"
        >
          <Link
            href={props.ctaPrimary.href}
            className="btn-gradient text-white font-medium text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] px-[6.4vw] py-[3.2vw] tablet:px-[3vw] tablet:py-[1.5vw] desktop:px-[1.25vw] desktop:py-[0.625vw] rounded-[2.133vw] tablet:rounded-[1vw] desktop:rounded-[0.417vw] text-center active:scale-[0.97] transition-transform"
          >
            {props.ctaPrimary.label}
          </Link>
          <Link
            href={props.ctaSecondary.href}
            className="border border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10 font-medium text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] px-[6.4vw] py-[3.2vw] tablet:px-[3vw] tablet:py-[1.5vw] desktop:px-[1.25vw] desktop:py-[0.625vw] rounded-[2.133vw] tablet:rounded-[1vw] desktop:rounded-[0.417vw] transition-colors text-center active:scale-[0.97] transition-transform"
          >
            {props.ctaSecondary.label}
          </Link>
        </motion.div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={typewriterDone ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.33, 1, 0.68, 1] }}
          className="flex items-center gap-[4.267vw] tablet:gap-[2vw] desktop:gap-[0.833vw] mt-[8.533vw] tablet:mt-[4vw] desktop:mt-[1.667vw]"
        >
          <Link
            href="https://linkedin.com/in/youssef-nesafe"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-accent-cyan transition-colors hover:scale-110 active:scale-95 transition-transform"
            aria-label="LinkedIn"
          >
            <FiLinkedin className="w-[5.333vw] h-[5.333vw] tablet:w-[2.5vw] tablet:h-[2.5vw] desktop:w-[1.042vw] desktop:h-[1.042vw]" />
          </Link>
          <a
            href="mailto:ynessafe@gmail.com"
            className="text-text-muted hover:text-accent-cyan transition-colors hover:scale-110 active:scale-95 transition-transform"
            aria-label="Email"
          >
            <FiMail className="w-[5.333vw] h-[5.333vw] tablet:w-[2.5vw] tablet:h-[2.5vw] desktop:w-[1.042vw] desktop:h-[1.042vw]" />
          </a>
        </motion.div>

        {/* Scroll indicator — fades out on scroll */}
        <motion.div
          style={{ opacity: scrollIndicatorOpacity, y: scrollIndicatorY }}
          className="mt-[10.667vw] tablet:mt-[5vw] desktop:mt-[2.604vw] flex flex-col items-center gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw]"
        >
          <span className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-text-muted">
            {props.scrollHint}
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <FiChevronDown className="w-[5.333vw] h-[5.333vw] tablet:w-[2.5vw] tablet:h-[2.5vw] desktop:w-[1.042vw] desktop:h-[1.042vw] text-accent-cyan" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
```

Key changes:
- Hero top padding reduced from `pt-[26.7vw]` to `pt-[20vw]` on mobile
- Parallax on gradient blobs (different speeds)
- Name uses `SplitText` for word-by-word reveal
- Scroll indicator fades out + translates down as user scrolls
- Buttons get `active:scale-[0.97]` for tactile click
- Social icons get `hover:scale-110 active:scale-95`

**Step 2: Verify it runs**

Run: `npm run dev`
Test: Scroll down — blobs should parallax, scroll indicator should fade.

**Step 3: Commit**

```bash
git add src/app/_sections/portfolio/HeroSection/index.tsx
git commit -m "feat(hero): add parallax blobs, word reveal, scroll-linked indicator"
```

---

## Task 10: About Section — Typewriter + Counter Overshoot + Parallax

**Files:**
- Modify: `src/app/_sections/portfolio/AboutSection/index.tsx`
- Modify: `src/app/_sections/portfolio/AboutSection/AnimatedCounter.tsx`

**Step 1: Update AboutSection with typewriter and parallax**

Replace the entire AboutSection:

```typescript
"use client";

import { motion } from "framer-motion";
import {
  fadeUp,
  staggerContainer,
  defaultViewport,
} from "@/app/lib/animations";
import type { IAboutSection } from "@/app/models/About";
import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";
import Terminal from "@/app/components/ui/Terminal";
import AnimatedCounter from "./AnimatedCounter";
import TypewriterText from "@/app/components/ui/TypewriterText";
import { useParallax } from "@/app/hooks/useParallax";

export default function AboutSection(props: IAboutSection) {
  const terminalParallax = useParallax({ speed: 0.15 });
  const statsParallax = useParallax({ speed: 0.25 });

  return (
    <Section id="about">
      <SectionHeading label={props.sectionLabel} title={props.title} />

      <div
        ref={terminalParallax.ref}
        className="flex flex-col desktop:flex-row gap-[8.533vw] tablet:gap-[4vw] desktop:gap-[1.667vw] items-center"
      >
        {/* Terminal */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={{
            hidden: { opacity: 0, x: -50 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
          }}
          style={{ y: terminalParallax.y }}
          className="desktop:w-[55%]"
        >
          <Terminal title="about.txt">
            <p className="text-accent-emerald mb-[2.667vw] tablet:mb-[1.25vw] desktop:mb-[0.521vw]">
              {props.terminal.command}
            </p>
            <TypewriterText
              lines={props.terminal.lines.map((line) => ({
                text: line,
                className:
                  "text-foreground mb-[2.667vw] tablet:mb-[1.25vw] desktop:mb-[0.521vw] last:mb-0",
              }))}
              speed={15}
              lineDelay={100}
            />
          </Terminal>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={staggerContainer}
          style={{ y: statsParallax.y }}
          className="desktop:w-[45%] grid grid-cols-2 gap-[4.267vw] tablet:gap-[2vw] desktop:gap-[0.833vw] h-fit"
        >
          {props.stats.map((stat) => (
            <motion.div key={stat.label} variants={fadeUp}>
              <AnimatedCounter
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}
```

**Step 2: Update AnimatedCounter with overshoot easing**

Replace the entire AnimatedCounter:

```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import GlowCard from "@/app/components/ui/GlowCard";

// Attempt overshoot then settle
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export default function AnimatedCounter({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutBack(progress);
      const current = eased * value;

      if (progress >= 1) {
        setCount(value);
      } else {
        setCount(Math.floor(current * 10) / 10);
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [isInView, value]);

  const displayValue =
    value % 1 !== 0 ? count.toFixed(1) : Math.floor(count).toLocaleString();

  return (
    <GlowCard>
      <div ref={ref} className="text-center">
        <span className="text-[8.533vw] tablet:text-[4vw] desktop:text-[1.667vw] font-bold gradient-text">
          {displayValue}
          {suffix}
        </span>
        <p className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-text-muted mt-[1.067vw] tablet:mt-[0.5vw] desktop:mt-[0.208vw]">
          {label}
        </p>
      </div>
    </GlowCard>
  );
}
```

Key changes:
- Counter uses `easeOutBack` — overshoots by ~5% then settles
- Uses `requestAnimationFrame` instead of `setInterval` for smoother animation
- Terminal text uses `TypewriterText` component for character-by-character reveal
- Terminal and stats have independent parallax speeds

**Step 3: Verify**

Run: `npm run dev`
Test: Scroll to About — terminal text should type out, counters should overshoot.

**Step 4: Commit**

```bash
git add src/app/_sections/portfolio/AboutSection/index.tsx src/app/_sections/portfolio/AboutSection/AnimatedCounter.tsx
git commit -m "feat(about): add typewriter terminal, counter overshoot, parallax split"
```

---

## Task 11: Projects Section — 3D Tilt + Image Parallax

**Files:**
- Modify: `src/app/_sections/portfolio/ProjectsSection/ProjectCard.tsx`

**Step 1: Add 3D tilt and image parallax**

Replace the entire ProjectCard:

```typescript
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { fadeUp, defaultViewport } from "@/app/lib/animations";
import type { ProjectItem } from "@/app/models/common";
import { useTilt } from "@/app/hooks/useTilt";

export default function ProjectCard({ item, index }: { item: ProjectItem; index: number }) {
  const imageRef = useRef<HTMLDivElement>(null);
  const { ref: tiltRef, style: tiltStyle, handlers } = useTilt({ maxTilt: 6, scale: 1.01 });

  // Image parallax within container
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <motion.div
      ref={tiltRef}
      data-xray="ProjectCard"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
      className="rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw] border border-border-subtle bg-bg-secondary overflow-hidden transition-all duration-300 hover:border-accent-cyan/30 hover:glow-cyan will-change-transform"
      style={tiltStyle}
      {...handlers}
    >
      {/* Image area with parallax */}
      <div ref={imageRef} className="relative aspect-video overflow-hidden group">
        <motion.div className="absolute inset-[-10%]" style={{ y: imageY }}>
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 800px) 100vw, 50vw"
          />
        </motion.div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-bg-secondary via-bg-secondary/40 to-transparent" />
        {/* Type badge */}
        <span className="absolute top-[2.667vw] left-[2.667vw] tablet:top-[1.25vw] tablet:left-[1.25vw] desktop:top-[0.521vw] desktop:left-[0.521vw] font-mono text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 rounded-[1.333vw] tablet:rounded-[0.625vw] desktop:rounded-[0.26vw] px-[2.667vw] py-[0.8vw] tablet:px-[1.25vw] tablet:py-[0.375vw] desktop:px-[0.521vw] desktop:py-[0.156vw]">
          {item.type}
        </span>
      </div>

      {/* Content area */}
      <div className="p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw] flex flex-col gap-[3.2vw] tablet:gap-[1.5vw] desktop:gap-[0.625vw]">
        <h3 className="text-text-heading">{item.title}</h3>

        <p className="text-text-muted text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] leading-relaxed">
          {item.description}
        </p>

        {/* Highlights */}
        <ul className="flex flex-col gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw]">
          {item.highlights.map((highlight) => (
            <li
              key={highlight}
              className="flex items-start gap-[2.133vw] tablet:gap-[1vw] desktop:gap-[0.417vw] text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-foreground"
            >
              <span className="text-accent-emerald mt-[0.8vw] tablet:mt-[0.375vw] desktop:mt-[0.156vw] shrink-0">
                ▹
              </span>
              {highlight}
            </li>
          ))}
        </ul>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw] mt-[1.067vw] tablet:mt-[0.5vw] desktop:mt-[0.208vw]">
          {item.tech.map((tech) => (
            <span
              key={tech}
              className="font-mono text-accent-cyan text-[2.667vw] tablet:text-[1.25vw] desktop:text-[0.521vw] bg-accent-cyan/5 border border-accent-cyan/10 rounded-[1.067vw] tablet:rounded-[0.5vw] desktop:rounded-[0.208vw] px-[2.133vw] py-[0.533vw] tablet:px-[1vw] tablet:py-[0.25vw] desktop:px-[0.417vw] desktop:py-[0.104vw]"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Visit Site link */}
        <Link
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw] text-accent-emerald text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] font-medium mt-[1.067vw] tablet:mt-[0.5vw] desktop:mt-[0.208vw] group/link"
        >
          <span className="relative">
            Visit Site
            <span className="absolute bottom-0 left-0 w-0 h-[0.267vw] tablet:h-[0.125vw] desktop:h-[0.052vw] bg-accent-emerald transition-all duration-300 group-hover/link:w-full" />
          </span>
          <svg
            className="w-[3.2vw] h-[3.2vw] tablet:w-[1.5vw] tablet:h-[1.5vw] desktop:w-[0.625vw] desktop:h-[0.625vw] transition-transform group-hover/link:translate-x-[0.267vw] group-hover/link:-translate-y-[0.267vw]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 17L17 7M17 7H7M17 7v10"
            />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
}
```

Key changes:
- 3D tilt on hover using `useTilt` hook
- Image parallax: image wrapper inset by -10% and translates Y based on scroll
- Visit Site link: underline slides in from left instead of instant toggle
- Arrow icon moves diagonally on hover

**Step 2: Verify**

Run: `npm run dev`
Test: Hover project cards — tilt should work. Scroll — images should parallax within container.

**Step 3: Commit**

```bash
git add src/app/_sections/portfolio/ProjectsSection/ProjectCard.tsx
git commit -m "feat(projects): add 3D tilt, image parallax, animated link underline"
```

---

## Task 12: Contact Section — Card Lift + Terminal Typing

**Files:**
- Modify: `src/app/_sections/portfolio/ContactSection/index.tsx`

**Step 1: Add spring lift to contact cards and typewriter to terminal**

Replace the contact card `<GlowCard>` content wrapper and terminal section:

In the contact cards, wrap each `<GlowCard>` with a spring hover lift:

Replace the entire ContactSection:

```typescript
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiLinkedin,
  FiExternalLink,
} from "react-icons/fi";
import {
  fadeLeft,
  fadeRight,
  fadeUp,
  staggerContainer,
  defaultViewport,
} from "@/app/lib/animations";
import type { IContactSection } from "@/app/models/Contact";
import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";
import GlowCard from "@/app/components/ui/GlowCard";
import Terminal from "@/app/components/ui/Terminal";
import TypewriterText from "@/app/components/ui/TypewriterText";
import type { IconType } from "react-icons";

const iconMap: Record<string, IconType> = {
  FiMail,
  FiPhone,
  FiMapPin,
  FiLinkedin,
};

export default function ContactSection(props: IContactSection) {
  return (
    <Section id="contact">
      <SectionHeading label={props.sectionLabel} title={props.title} />

      <motion.p
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        variants={fadeUp}
        className="text-[4.267vw] tablet:text-[2vw] desktop:text-[0.833vw] text-text-muted mb-[8.533vw] tablet:mb-[4vw] desktop:mb-[1.667vw] max-w-[160vw] tablet:max-w-[75vw] desktop:max-w-[31.25vw]"
      >
        {props.description}
      </motion.p>

      <div className="flex flex-col desktop:flex-row gap-[8.533vw] tablet:gap-[4vw] desktop:gap-[1.667vw] items-center">
        {/* Contact cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={staggerContainer}
          className="desktop:w-[50%] grid grid-cols-1 tablet:grid-cols-2 gap-[4.267vw] tablet:gap-[2vw] desktop:gap-[0.833vw] h-fit"
        >
          {props.items.map((item) => {
            const Icon = iconMap[item.icon];
            const cardContent = (
              <>
                <div className="p-[2.667vw] tablet:p-[1.25vw] desktop:p-[0.521vw] rounded-[2.133vw] tablet:rounded-[1vw] desktop:rounded-[0.417vw] bg-accent-cyan/10 text-accent-cyan group-hover:bg-accent-cyan/20 transition-colors shrink-0">
                  {Icon && (
                    <Icon className="w-[5.333vw] h-[5.333vw] tablet:w-[2.5vw] tablet:h-[2.5vw] desktop:w-[1.042vw] desktop:h-[1.042vw]" />
                  )}
                </div>
                <div>
                  <p className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-text-muted mb-[0.533vw] tablet:mb-[0.25vw] desktop:mb-[0.104vw]">
                    {item.type}
                  </p>
                  <p className="text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] text-foreground group-hover:text-accent-cyan transition-colors flex items-center gap-[1.067vw] tablet:gap-[0.5vw] desktop:gap-[0.208vw]">
                    {item.value}
                    {item.href !== "#" && (
                      <FiExternalLink className="w-[2.667vw] h-[2.667vw] tablet:w-[1.25vw] tablet:h-[1.25vw] desktop:w-[0.521vw] desktop:h-[0.521vw] opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </p>
                </div>
              </>
            );
            const className =
              "flex items-start gap-[3.2vw] tablet:gap-[1.5vw] desktop:gap-[0.625vw] group";
            return (
              <motion.div
                key={item.type}
                variants={fadeLeft}
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              >
                <GlowCard>
                  {item.href.startsWith("http") ? (
                    <Link
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={className}
                    >
                      {cardContent}
                    </Link>
                  ) : (
                    <a href={item.href} className={className}>
                      {cardContent}
                    </a>
                  )}
                </GlowCard>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Terminal CTA with typewriter */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeRight}
          className="desktop:w-[50%]"
        >
          <Terminal title="contact.ts">
            <TypewriterText
              lines={[
                { text: props.terminal.command, className: "text-accent-purple" },
                ...props.terminal.lines.map((line) => ({
                  text: line,
                  className: "text-foreground",
                })),
              ]}
              speed={20}
              lineDelay={150}
            />
          </Terminal>
        </motion.div>
      </div>
    </Section>
  );
}
```

Key changes:
- Contact cards have `whileHover={{ y: -4 }}` with spring physics for lift effect
- Terminal uses `TypewriterText` for character-by-character reveal

**Step 2: Verify**

Run: `npm run dev`
Test: Hover contact cards — should lift. Scroll to contact terminal — should type out.

**Step 3: Commit**

```bash
git add src/app/_sections/portfolio/ContactSection/index.tsx
git commit -m "feat(contact): add spring lift on cards, typewriter terminal"
```

---

## Task 13: Enhanced Cursor — Hover States

**Files:**
- Modify: `src/app/components/cursor/CustomCursor.tsx`
- Modify: `src/app/components/cursor/useMousePosition.ts`

**Step 1: Add hover detection to useMousePosition**

Add hover target tracking to the existing hook. Add a `hoveredElement` state that detects when the cursor is over interactive elements:

In `useMousePosition.ts`, add to the `MouseState` interface and tracking:

```typescript
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

type CursorVariant = "default" | "pointer" | "text";

interface MouseState {
  x: number;
  y: number;
  isVisible: boolean;
  variant: CursorVariant;
}

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select, [data-cursor="pointer"]';

export function useMousePosition(): MouseState {
  const [isDesktop, setIsDesktop] = useState(false);
  const stateRef = useRef<MouseState>({
    x: 0,
    y: 0,
    isVisible: false,
    variant: "default",
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

      // Detect hover target
      const target = e.target as Element;
      if (target?.closest(INTERACTIVE_SELECTOR)) {
        stateRef.current.variant = "pointer";
      } else {
        stateRef.current.variant = "default";
      }

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
    return { x: 0, y: 0, isVisible: false, variant: "default" };
  }

  return state;
}
```

**Step 2: Update CustomCursor to react to hover state**

Replace the entire CustomCursor:

```typescript
"use client";

import { useEffect, useRef } from "react";
import { useMousePosition } from "./useMousePosition";
import { useViewMode } from "@/app/components/view-mode/ViewModeContext";

const CURSOR_COLOR = "#06B6D4";

export default function CustomCursor() {
  const { x, y, isVisible, variant } = useMousePosition();
  const { mode } = useViewMode();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const isPointer = variant === "pointer";

  useEffect(() => {
    if (dotRef.current) {
      const size = isPointer ? 4 : 6;
      const offset = size / 2;
      dotRef.current.style.transform = `translate3d(${x - offset}px, ${y - offset}px, 0) scale(${isPointer ? 0.5 : 1})`;
      dotRef.current.style.opacity = isVisible ? "1" : "0";
    }
  }, [x, y, isVisible, isPointer]);

  useEffect(() => {
    if (ringRef.current) {
      const size = isPointer ? 48 : 32;
      const offset = size / 2;
      ringRef.current.style.transform = `translate3d(${x - offset}px, ${y - offset}px, 0)`;
      ringRef.current.style.opacity = isVisible ? "1" : "0";
      ringRef.current.style.width = `${size}px`;
      ringRef.current.style.height = `${size}px`;
      ringRef.current.style.borderColor = isPointer
        ? `${CURSOR_COLOR}90`
        : `${CURSOR_COLOR}60`;
      ringRef.current.style.backgroundColor = isPointer
        ? `${CURSOR_COLOR}10`
        : "transparent";
    }
  }, [x, y, isVisible, isPointer]);

  if (mode === "dev") return null;

  return (
    <>
      {/* Center dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-50 pointer-events-none hidden desktop:block w-[6px] h-[6px] rounded-full opacity-0 will-change-transform"
        style={{
          backgroundColor: CURSOR_COLOR,
          transition: "opacity 300ms ease, transform 100ms ease-out, width 200ms ease, height 200ms ease",
        }}
        aria-hidden="true"
      />
      {/* Outer ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-50 pointer-events-none hidden desktop:block rounded-full opacity-0 will-change-transform"
        style={{
          width: "32px",
          height: "32px",
          border: `1.5px solid ${CURSOR_COLOR}60`,
          transition: "transform 150ms ease-out, opacity 300ms ease, width 300ms cubic-bezier(0.33, 1, 0.68, 1), height 300ms cubic-bezier(0.33, 1, 0.68, 1), border-color 300ms ease, background-color 300ms ease",
        }}
        aria-hidden="true"
      />
    </>
  );
}
```

Key changes:
- Cursor detects interactive elements (links, buttons, inputs)
- Ring expands from 32px to 48px on hover
- Ring gets subtle fill and brighter border on hover
- Dot shrinks on hover
- Smooth transitions between states

**Step 3: Commit**

```bash
git add src/app/components/cursor/CustomCursor.tsx src/app/components/cursor/useMousePosition.ts
git commit -m "feat(cursor): add hover-aware cursor with expand/shrink states"
```

---

## Task 14: SectionHeading — Animated Underline

**Files:**
- Modify: `src/app/components/ui/SectionHeading/index.tsx`

**Step 1: Add gradient underline animation on entry**

Replace the static underline with an animated one:

```typescript
"use client";

import { motion } from "framer-motion";
import { fadeUp, defaultViewport } from "@/app/lib/animations";
import { cn } from "@/app/utils/cn";

interface SectionHeadingProps {
  label: string;
  title: string;
  className?: string;
}

export default function SectionHeading({
  label,
  title,
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      data-xray="SectionHeading"
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      variants={fadeUp}
      className={cn(
        "mb-[10.667vw] tablet:mb-[5vw] desktop:mb-[2.604vw]",
        className
      )}
    >
      <span className="text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] font-mono text-accent-purple mb-[2.667vw] tablet:mb-[1.25vw] desktop:mb-[0.521vw] block">
        {label}
      </span>
      <h2 className="text-text-heading">
        {title}
        <span className="gradient-text">.</span>
      </h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
        className="mt-[2.667vw] tablet:mt-[1.25vw] desktop:mt-[0.521vw] h-[0.533vw] tablet:h-[0.25vw] desktop:h-[0.104vw] w-[16vw] tablet:w-[7.5vw] desktop:w-[3.125vw] bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full origin-left"
      />
    </motion.div>
  );
}
```

Key change: The underline grows from left via `scaleX: 0 → 1` with a 0.3s delay.

**Step 2: Commit**

```bash
git add src/app/components/ui/SectionHeading/index.tsx
git commit -m "feat(ui): animate section heading underline from left on scroll"
```

---

## Task 15: TechBadge — Enhanced Hover

**Files:**
- Modify: `src/app/components/ui/TechBadge/index.tsx`

**Step 1: Add tilt + glow hover effect**

```typescript
"use client";

import { motion } from "framer-motion";
import { scaleUp } from "@/app/lib/animations";
import * as SiIcons from "react-icons/si";
import type { IconType } from "react-icons";

interface TechBadgeProps {
  name: string;
  icon: string;
  color: string;
}

const iconMap: Record<string, IconType> = SiIcons as unknown as Record<
  string,
  IconType
>;

export default function TechBadge({ name, icon, color }: TechBadgeProps) {
  const IconComponent = iconMap[icon];

  return (
    <motion.div
      data-xray="TechBadge"
      variants={scaleUp}
      whileHover={{
        y: -3,
        rotate: 2,
        transition: { type: "spring", stiffness: 400, damping: 20 },
      }}
      className="flex items-center gap-[2.133vw] tablet:gap-[1vw] desktop:gap-[0.417vw] rounded-[2.133vw] tablet:rounded-[1vw] desktop:rounded-[0.417vw] border border-border-subtle bg-bg-secondary px-[3.2vw] py-[2.133vw] tablet:px-[1.5vw] tablet:py-[1vw] desktop:px-[0.625vw] desktop:py-[0.417vw] transition-colors duration-200 hover:border-accent-cyan/30 cursor-default"
    >
      {IconComponent && (
        <IconComponent
          className="w-[4.267vw] h-[4.267vw] tablet:w-[2vw] tablet:h-[2vw] desktop:w-[0.833vw] desktop:h-[0.833vw]"
          style={{ color }}
        />
      )}
      <span className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-foreground">{name}</span>
    </motion.div>
  );
}
```

Key changes:
- Hover uses Framer Motion `whileHover` with spring physics instead of CSS translate
- Adds slight 2deg rotation on hover for playful feel
- Border brightens on hover

**Step 2: Commit**

```bash
git add src/app/components/ui/TechBadge/index.tsx
git commit -m "feat(ui): add spring tilt and glow hover to tech badges"
```

---

## Task 16: View Transition — Click Origin + Faster Duration

**Files:**
- Modify: `src/app/components/view-transitions/ViewTransitionLink.tsx`
- Modify: `src/app/styles/tailwind.css`

**Step 1: Use click position for iris origin**

In `ViewTransitionLink.tsx`, replace the iris origin calculation:

Replace:
```typescript
      // Set iris reveal origin to center of viewport
      const x = window.innerWidth / 2;
      const y = window.innerHeight / 2;
```

With:
```typescript
      // Set iris reveal origin to click position
      const x = mouseEvent.clientX;
      const y = mouseEvent.clientY;
```

**Step 2: Reduce animation duration in tailwind.css**

Replace `1400ms` with `800ms` in both view transition animations:

Replace:
```css
::view-transition-old(root) {
  animation: iris-out 1400ms cubic-bezier(0.4, 0, 0.2, 1) both;
```

With:
```css
::view-transition-old(root) {
  animation: iris-out 800ms cubic-bezier(0.4, 0, 0.2, 1) both;
```

Replace:
```css
::view-transition-new(root) {
  animation: iris-in 1400ms cubic-bezier(0.4, 0, 0.2, 1) both;
```

With:
```css
::view-transition-new(root) {
  animation: iris-in 800ms cubic-bezier(0.4, 0, 0.2, 1) both;
```

**Step 3: Commit**

```bash
git add src/app/components/view-transitions/ViewTransitionLink.tsx src/app/styles/tailwind.css
git commit -m "feat(transitions): iris reveal from click point, reduce to 800ms"
```

---

## Task 17: Section Dividers Between Sections

**Files:**
- Modify: `src/app/(public)/page.tsx`

**Step 1: Read the current page.tsx first to understand the structure**

Read `src/app/(public)/page.tsx` and add `SectionDivider` between each section.

Import `SectionDivider` and insert `<SectionDivider />` between each section component in the JSX.

Example pattern (adapt to actual structure):
```tsx
import SectionDivider from "@/app/components/ui/SectionDivider";

// In the JSX:
<HeroSection {...dict.hero} />
<SectionDivider />
<AboutSection {...dict.about} />
<SectionDivider />
<ExperienceSection {...dict.experience} />
<SectionDivider />
<ProjectsSection {...dict.projects} />
<SectionDivider />
<SkillsSection {...dict.skills} />
<SectionDivider />
<ContactSection {...dict.contact} />
```

**Step 2: Verify**

Run: `npm run dev`
Test: Subtle gradient lines should appear between sections.

**Step 3: Commit**

```bash
git add src/app/(public)/page.tsx
git commit -m "feat: add gradient section dividers for visual flow"
```

---

## Task 18: Image Blur Placeholders

**Files:**
- Modify: `src/app/_sections/portfolio/ProjectsSection/ProjectCard.tsx`

**Step 1: Add blurDataURL to project images**

Add a static tiny base64 blur placeholder to the Image component. In ProjectCard, add to the `<Image>` tag:

```tsx
placeholder="blur"
blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAADklEQVQI12P4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg=="
```

**Step 2: Commit**

```bash
git add src/app/_sections/portfolio/ProjectsSection/ProjectCard.tsx
git commit -m "perf: add blur placeholder to project images"
```

---

## Task 19: Build Verification

**Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 2: Run linter**

Run: `npm run lint`
Expected: No new errors.

**Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds.

**Step 4: Fix any issues found in steps 1-3**

If there are errors, fix them and commit the fixes.

**Step 5: Final commit if fixes were needed**

```bash
git commit -m "fix: resolve build issues from scroll storytelling implementation"
```

---

## Summary of All Tasks

| # | Task | Type |
|---|------|------|
| 1 | `useParallax` hook | Infrastructure |
| 2 | `useMagneticElement` hook | Infrastructure |
| 3 | `useTilt` hook | Infrastructure |
| 4 | `SplitText` component | Infrastructure |
| 5 | `SectionDivider` component | Infrastructure |
| 6 | `TypewriterText` component | Infrastructure |
| 7 | Lazy load InteractiveTerminal | Performance |
| 8 | Focus indicators + skip link | Accessibility |
| 9 | Hero parallax + scroll indicator | Section enhancement |
| 10 | About typewriter + counter overshoot | Section enhancement |
| 11 | Projects 3D tilt + image parallax | Section enhancement |
| 12 | Contact card lift + terminal typing | Section enhancement |
| 13 | Cursor hover states | Micro-interaction |
| 14 | Section heading animated underline | Micro-interaction |
| 15 | TechBadge enhanced hover | Micro-interaction |
| 16 | View transition click origin + speed | UX fix |
| 17 | Section dividers between sections | Visual flow |
| 18 | Image blur placeholders | Performance |
| 19 | Build verification | QA |

Tasks 1-6 are independent infrastructure and can be parallelized.
Tasks 7-8 are independent performance/a11y fixes.
Tasks 9-12 depend on infrastructure (tasks 1, 4, 6).
Tasks 13-18 are independent of each other.
Task 19 must run last.

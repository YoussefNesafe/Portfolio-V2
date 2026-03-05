# Easter Eggs & Konami Code — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 5 hidden easter eggs (Konami Code, logo clicks, secret words, console message) to the portfolio for visitor delight.

**Architecture:** Single `EasterEggsProvider` client component wraps the public layout. Custom hooks handle detection (keyboard sequences, click counting). Effect components render overlays (Matrix rain canvas, toasts, glitch CSS). Context bridges to Header and HeroSection.

**Tech Stack:** React 19 hooks, Canvas API, Framer Motion, CSS keyframes, Vitest + @testing-library/react

**Design doc:** `docs/plans/2026-03-05-easter-eggs-design.md`

**Test environment:** Vitest with `globals: true`, environment `node`. Setup file mocks `next/cache`. Tests go in `__tests__/` dirs next to source. Run with `npm test`.

**Note:** The vitest environment is `node`, not `jsdom`. Hook tests use `renderHook` from `@testing-library/react`. Component render tests that need DOM will need `@vitest/jsdom` or be kept minimal. Focus tests on hooks (pure logic) and console output. Effect components are primarily visual — test mount/unmount and callbacks, not pixel output.

---

### Task 1: useKonamiCode Hook

**Files:**
- Create: `src/app/components/easter-eggs/hooks/useKonamiCode.ts`
- Create: `src/app/components/easter-eggs/hooks/__tests__/useKonamiCode.test.ts`

**Step 1: Write the failing test**

```ts
// src/app/components/easter-eggs/hooks/__tests__/useKonamiCode.test.ts
import { describe, it, expect, vi } from "vitest";

// We test the pure detection logic, not the hook itself (avoids jsdom dependency)
import { matchesKonamiSequence, KONAMI_SEQUENCE } from "../useKonamiCode";

describe("matchesKonamiSequence", () => {
  it("returns true when buffer matches the full Konami sequence", () => {
    expect(matchesKonamiSequence([...KONAMI_SEQUENCE])).toBe(true);
  });

  it("returns false for partial sequence", () => {
    expect(matchesKonamiSequence(["ArrowUp", "ArrowUp", "ArrowDown"])).toBe(false);
  });

  it("returns false for empty buffer", () => {
    expect(matchesKonamiSequence([])).toBe(false);
  });

  it("returns false for wrong sequence", () => {
    const wrong = ["ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    expect(matchesKonamiSequence(wrong)).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/components/easter-eggs/hooks/__tests__/useKonamiCode.test.ts`
Expected: FAIL — cannot find module

**Step 3: Write minimal implementation**

```ts
// src/app/components/easter-eggs/hooks/useKonamiCode.ts
import { useEffect, useRef, useCallback } from "react";

export const KONAMI_SEQUENCE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
] as const;

export function matchesKonamiSequence(buffer: string[]): boolean {
  if (buffer.length !== KONAMI_SEQUENCE.length) return false;
  return buffer.every((key, i) => key === KONAMI_SEQUENCE[i]);
}

export function useKonamiCode(onActivate: () => void) {
  const bufferRef = useRef<string[]>([]);
  const onActivateRef = useRef(onActivate);

  useEffect(() => {
    onActivateRef.current = onActivate;
  }, [onActivate]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    bufferRef.current = [...bufferRef.current, e.key].slice(-KONAMI_SEQUENCE.length);
    if (matchesKonamiSequence(bufferRef.current)) {
      bufferRef.current = [];
      onActivateRef.current();
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/components/easter-eggs/hooks/__tests__/useKonamiCode.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/components/easter-eggs/hooks/useKonamiCode.ts src/app/components/easter-eggs/hooks/__tests__/useKonamiCode.test.ts
git commit -m "feat(easter-eggs): add useKonamiCode hook with tests"
```

---

### Task 2: useSecretWord Hook

**Files:**
- Create: `src/app/components/easter-eggs/hooks/useSecretWord.ts`
- Create: `src/app/components/easter-eggs/hooks/__tests__/useSecretWord.test.ts`

**Step 1: Write the failing test**

```ts
// src/app/components/easter-eggs/hooks/__tests__/useSecretWord.test.ts
import { describe, it, expect } from "vitest";
import { checkWordMatch } from "../useSecretWord";

describe("checkWordMatch", () => {
  it("returns matched word when buffer ends with a registered word", () => {
    const words = ["hire", "hello"];
    expect(checkWordMatch("xhire".split(""), words)).toBe("hire");
  });

  it("returns matched word for hello", () => {
    const words = ["hire", "hello"];
    expect(checkWordMatch("abchello".split(""), words)).toBe("hello");
  });

  it("returns null when no word matches", () => {
    const words = ["hire", "hello"];
    expect(checkWordMatch("xyz".split(""), words)).toBeNull();
  });

  it("returns null for empty buffer", () => {
    const words = ["hire", "hello"];
    expect(checkWordMatch([], words)).toBeNull();
  });

  it("is case-insensitive", () => {
    const words = ["hire"];
    expect(checkWordMatch("HIRE".split(""), words)).toBe("hire");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/components/easter-eggs/hooks/__tests__/useSecretWord.test.ts`
Expected: FAIL — cannot find module

**Step 3: Write minimal implementation**

```ts
// src/app/components/easter-eggs/hooks/useSecretWord.ts
import { useEffect, useRef, useCallback } from "react";

export function checkWordMatch(buffer: string[], words: string[]): string | null {
  const joined = buffer.join("").toLowerCase();
  for (const word of words) {
    if (joined.endsWith(word)) return word;
  }
  return null;
}

export function useSecretWord(
  words: string[],
  onMatch: (word: string) => void,
) {
  const bufferRef = useRef<string[]>([]);
  const onMatchRef = useRef(onMatch);
  const maxLen = Math.max(...words.map((w) => w.length), 0);

  useEffect(() => {
    onMatchRef.current = onMatch;
  }, [onMatch]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key.length !== 1) return; // ignore special keys
      bufferRef.current = [...bufferRef.current, e.key].slice(-maxLen);
      const matched = checkWordMatch(bufferRef.current, words);
      if (matched) {
        bufferRef.current = [];
        onMatchRef.current(matched);
      }
    },
    [words, maxLen],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/components/easter-eggs/hooks/__tests__/useSecretWord.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/components/easter-eggs/hooks/useSecretWord.ts src/app/components/easter-eggs/hooks/__tests__/useSecretWord.test.ts
git commit -m "feat(easter-eggs): add useSecretWord hook with tests"
```

---

### Task 3: Console Message

**Files:**
- Create: `src/app/components/easter-eggs/console-message.ts`
- Create: `src/app/components/easter-eggs/__tests__/console-message.test.ts`

**Step 1: Write the failing test**

```ts
// src/app/components/easter-eggs/__tests__/console-message.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("printConsoleMessage", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("logs the ASCII art and welcome message", async () => {
    const { printConsoleMessage } = await import("../console-message");
    printConsoleMessage();
    expect(console.log).toHaveBeenCalled();
    const allCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls
      .map((c) => c.join(" "))
      .join("\n");
    expect(allCalls).toContain("HACK DETECTED");
    expect(allCalls).toContain("Just kidding");
    expect(allCalls).toContain("linkedin.com/in/youssef-nesafe");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/components/easter-eggs/__tests__/console-message.test.ts`
Expected: FAIL — cannot find module

**Step 3: Write minimal implementation**

```ts
// src/app/components/easter-eggs/console-message.ts
export function printConsoleMessage() {
  const styles = {
    header: "color: #06B6D4; font-size: 14px; font-weight: bold;",
    warning: "color: #A855F7; font-size: 18px; font-weight: bold;",
    text: "color: #10B981; font-size: 12px;",
    link: "color: #06B6D4; font-size: 12px; text-decoration: underline;",
  };

  console.log("%c🔍 SECURITY SCAN INITIATED...", styles.header);
  console.log("%c██████████████████ 100%", styles.header);
  console.log("%c⚠️  HACK DETECTED!", styles.warning);
  console.log("");
  console.log("%cJust kidding 😄 — welcome, fellow developer!", styles.text);
  console.log("");
  console.log(
    "%cBuilt with Next.js, React, TypeScript & curiosity.",
    styles.text,
  );
  console.log(
    "%cLet's connect → linkedin.com/in/youssef-nesafe",
    styles.link,
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/components/easter-eggs/__tests__/console-message.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/components/easter-eggs/console-message.ts src/app/components/easter-eggs/__tests__/console-message.test.ts
git commit -m "feat(easter-eggs): add styled console message with tests"
```

---

### Task 4: MatrixRain Effect Component

**Files:**
- Create: `src/app/components/easter-eggs/effects/MatrixRain.tsx`

No unit test for this — it's a Canvas rendering component. Verified visually and through integration.

**Step 1: Write implementation**

```tsx
// src/app/components/easter-eggs/effects/MatrixRain.tsx
"use client";

import { useEffect, useRef } from "react";

interface MatrixRainProps {
  duration?: number;
  onComplete: () => void;
}

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";
const FONT_SIZE = 14;
const COLOR = "#06B6D4";
const FADE_COLOR = "rgba(10, 10, 15, 0.05)";

export default function MatrixRain({ duration = 4000, onComplete }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const columns = Math.floor(canvas.width / FONT_SIZE);
    const drops: number[] = Array.from({ length: columns }, () =>
      Math.random() * -canvas.height / FONT_SIZE
    );

    let animationId: number;
    const startTime = Date.now();

    function draw() {
      if (!ctx || !canvas) return;

      const elapsed = Date.now() - startTime;
      const opacity = elapsed > duration - 1000
        ? Math.max(0, 1 - (elapsed - (duration - 1000)) / 1000)
        : 1;

      ctx.fillStyle = FADE_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = COLOR;
      ctx.font = `${FONT_SIZE}px monospace`;
      ctx.globalAlpha = opacity;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(char, i * FONT_SIZE, drops[i] * FONT_SIZE);

        if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      ctx.globalAlpha = 1;

      if (elapsed < duration) {
        animationId = requestAnimationFrame(draw);
      } else {
        onComplete();
      }
    }

    animationId = requestAnimationFrame(draw);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [duration, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
      aria-hidden="true"
    />
  );
}
```

**Step 2: Commit**

```bash
git add src/app/components/easter-eggs/effects/MatrixRain.tsx
git commit -m "feat(easter-eggs): add Matrix rain canvas effect"
```

---

### Task 5: SecretMessage Modal

**Files:**
- Create: `src/app/components/easter-eggs/effects/SecretMessage.tsx`

**Step 1: Write implementation**

```tsx
// src/app/components/easter-eggs/effects/SecretMessage.tsx
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

interface SecretMessageProps {
  onDismiss: () => void;
}

export default function SecretMessage({ onDismiss }: SecretMessageProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Secret message"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/60 backdrop-blur-md"
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative z-10 max-w-[90vw] tablet:max-w-[50vw] desktop:max-w-[26.042vw] bg-bg-secondary/90 backdrop-blur-lg border border-accent-cyan/30 rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw] p-[6.4vw] tablet:p-[3vw] desktop:p-[1.25vw] text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[5.333vw] tablet:text-[2.5vw] desktop:text-[1.042vw] mb-[2.667vw] tablet:mb-[1.25vw] desktop:mb-[0.521vw]">
          🎉
        </p>
        <h2 className="text-[4.267vw] tablet:text-[2vw] desktop:text-[0.833vw] font-bold text-text-heading mb-[2.667vw] tablet:mb-[1.25vw] desktop:mb-[0.521vw]">
          You cracked the code!
        </h2>
        <p className="text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] text-text-muted leading-relaxed">
          Here&apos;s a secret: I built this entire portfolio with Next.js,
          React &amp; TypeScript. Feel free to explore the source.
        </p>
        <button
          onClick={onDismiss}
          className="mt-[4.267vw] tablet:mt-[2vw] desktop:mt-[0.833vw] text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-accent-cyan hover:text-accent-cyan/80 transition-colors cursor-pointer"
        >
          Press Escape or click to close
        </button>
      </motion.div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/components/easter-eggs/effects/SecretMessage.tsx
git commit -m "feat(easter-eggs): add secret message modal"
```

---

### Task 6: HireToast Component

**Files:**
- Create: `src/app/components/easter-eggs/effects/HireToast.tsx`

**Step 1: Write implementation**

```tsx
// src/app/components/easter-eggs/effects/HireToast.tsx
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface HireToastProps {
  onDismiss: () => void;
  autoDismissMs?: number;
}

export default function HireToast({ onDismiss, autoDismissMs = 4000 }: HireToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [onDismiss, autoDismissMs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, x: 0 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed bottom-[4.267vw] right-[4.267vw] tablet:bottom-[2vw] tablet:right-[2vw] desktop:bottom-[0.833vw] desktop:right-[0.833vw] z-50 bg-bg-secondary/90 backdrop-blur-lg border border-accent-cyan/30 rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw] p-[4.267vw] tablet:p-[2vw] desktop:p-[0.833vw] cursor-pointer"
      onClick={onDismiss}
    >
      <p className="text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] font-medium text-text-heading">
        Great choice! Let&apos;s talk 🚀
      </p>
      <Link
        href="#contact"
        onClick={onDismiss}
        className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-accent-cyan hover:text-accent-cyan/80 transition-colors mt-[1.333vw] tablet:mt-[0.625vw] desktop:mt-[0.26vw] inline-block"
      >
        Go to contact →
      </Link>
    </motion.div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/components/easter-eggs/effects/HireToast.tsx
git commit -m "feat(easter-eggs): add hire toast component"
```

---

### Task 7: LogoGlitch Effect Component

**Files:**
- Create: `src/app/components/easter-eggs/effects/LogoGlitch.tsx`

**Step 1: Write implementation**

This is a CSS overlay that wraps the logo. It uses a `@keyframes` animation applied via Tailwind arbitrary values and inline styles.

```tsx
// src/app/components/easter-eggs/effects/LogoGlitch.tsx
"use client";

import { useEffect, useState } from "react";

interface LogoGlitchProps {
  active: boolean;
  onComplete: () => void;
  duration?: number;
}

export default function LogoGlitch({ active, onComplete, duration = 2000 }: LogoGlitchProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, duration);
    return () => clearTimeout(timer);
  }, [active, duration, onComplete]);

  if (!visible) return null;

  return (
    <style>{`
      @keyframes logo-glitch {
        0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
        10% { clip-path: inset(20% 0 40% 0); transform: translate(-2px, 1px); filter: hue-rotate(90deg); }
        20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); }
        30% { clip-path: inset(10% 0 70% 0); transform: translate(-1px, 2px); filter: hue-rotate(180deg); }
        40% { clip-path: inset(50% 0 20% 0); transform: translate(1px, -2px); }
        50% { clip-path: inset(30% 0 30% 0); transform: translate(-2px, 0); filter: hue-rotate(270deg); }
        60% { clip-path: inset(70% 0 5% 0); transform: translate(2px, 1px); }
        70% { clip-path: inset(5% 0 60% 0); transform: translate(0, -1px); filter: hue-rotate(45deg); }
        80% { clip-path: inset(40% 0 30% 0); transform: translate(-1px, 1px); }
        90% { clip-path: inset(15% 0 50% 0); transform: translate(1px, 0); filter: hue-rotate(135deg); }
      }
      [data-logo-glitch] {
        animation: logo-glitch 0.3s infinite;
        filter: drop-shadow(2px 0 #06B6D4) drop-shadow(-2px 0 #A855F7);
      }
    `}</style>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/components/easter-eggs/effects/LogoGlitch.tsx
git commit -m "feat(easter-eggs): add logo glitch CSS effect"
```

---

### Task 8: EasterEggsContext + EasterEggsProvider

**Files:**
- Create: `src/app/components/easter-eggs/EasterEggsContext.ts`
- Create: `src/app/components/easter-eggs/EasterEggsProvider.tsx`

**Step 1: Write context**

```ts
// src/app/components/easter-eggs/EasterEggsContext.ts
"use client";

import { createContext, useContext } from "react";

interface EasterEggsContextType {
  onLogoClick: () => void;
  triggerHelloEgg: boolean;
}

export const EasterEggsContext = createContext<EasterEggsContextType>({
  onLogoClick: () => {},
  triggerHelloEgg: false,
});

export function useEasterEggs() {
  return useContext(EasterEggsContext);
}
```

**Step 2: Write provider**

```tsx
// src/app/components/easter-eggs/EasterEggsProvider.tsx
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { EasterEggsContext } from "./EasterEggsContext";
import { useKonamiCode } from "./hooks/useKonamiCode";
import { useSecretWord } from "./hooks/useSecretWord";
import { printConsoleMessage } from "./console-message";
import MatrixRain from "./effects/MatrixRain";
import SecretMessage from "./effects/SecretMessage";
import HireToast from "./effects/HireToast";
import LogoGlitch from "./effects/LogoGlitch";

const LOGO_CLICK_THRESHOLD = 5;
const LOGO_CLICK_TIMEOUT = 2000;
const SECRET_WORDS = ["hire", "hello"];

export default function EasterEggsProvider({ children }: { children: React.ReactNode }) {
  // Konami state
  const [showMatrix, setShowMatrix] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Logo glitch state
  const [logoGlitch, setLogoGlitch] = useState(false);
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Toast state
  const [showHireToast, setShowHireToast] = useState(false);

  // Hello egg state
  const [triggerHelloEgg, setTriggerHelloEgg] = useState(false);

  // Console message — fire once
  useEffect(() => {
    printConsoleMessage();
  }, []);

  // Konami code handler
  useKonamiCode(
    useCallback(() => {
      if (!showMatrix && !showSecret) {
        setShowMatrix(true);
      }
    }, [showMatrix, showSecret]),
  );

  // Secret word handler
  useSecretWord(
    SECRET_WORDS,
    useCallback(
      (word: string) => {
        if (word === "hire" && !showHireToast) {
          setShowHireToast(true);
        }
        if (word === "hello") {
          setTriggerHelloEgg(true);
          setTimeout(() => setTriggerHelloEgg(false), 3000);
        }
      },
      [showHireToast],
    ),
  );

  // Logo click handler
  const onLogoClick = useCallback(() => {
    logoClickCount.current++;
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    logoClickTimer.current = setTimeout(() => {
      logoClickCount.current = 0;
    }, LOGO_CLICK_TIMEOUT);

    if (logoClickCount.current >= LOGO_CLICK_THRESHOLD) {
      logoClickCount.current = 0;
      setLogoGlitch(true);
    }
  }, []);

  return (
    <EasterEggsContext.Provider value={{ onLogoClick, triggerHelloEgg }}>
      {children}

      {/* Konami: Matrix Rain → Secret Message */}
      {showMatrix && (
        <MatrixRain
          onComplete={() => {
            setShowMatrix(false);
            setShowSecret(true);
          }}
        />
      )}
      <AnimatePresence>
        {showSecret && (
          <SecretMessage onDismiss={() => setShowSecret(false)} />
        )}
      </AnimatePresence>

      {/* Logo glitch CSS injection */}
      <LogoGlitch
        active={logoGlitch}
        onComplete={() => setLogoGlitch(false)}
      />

      {/* Hire toast */}
      <AnimatePresence>
        {showHireToast && (
          <HireToast onDismiss={() => setShowHireToast(false)} />
        )}
      </AnimatePresence>
    </EasterEggsContext.Provider>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/components/easter-eggs/EasterEggsContext.ts src/app/components/easter-eggs/EasterEggsProvider.tsx
git commit -m "feat(easter-eggs): add EasterEggsProvider with context and all effects"
```

---

### Task 9: Integrate Provider into Public Layout

**Files:**
- Modify: `src/app/(public)/layout.tsx`

**Step 1: Update layout**

The layout is a server component. We need to wrap the content with the client `EasterEggsProvider`. Since `EasterEggsProvider` is `"use client"`, it can be imported and used as a wrapper inside a server component.

```tsx
// src/app/(public)/layout.tsx
import { getDictionary } from "@/get-dictionary";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import ScrollProgress from "@/app/components/ui/ScrollProgress";
import EasterEggsProvider from "@/app/components/easter-eggs/EasterEggsProvider";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dict = await getDictionary();

  return (
    <EasterEggsProvider>
      <main className="overflow-x-clip">
        <ScrollProgress />
        <Header {...dict.layout.header} />
        {children}
        <Footer {...dict.layout.footer} />
      </main>
    </EasterEggsProvider>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/(public)/layout.tsx
git commit -m "feat(easter-eggs): integrate EasterEggsProvider into public layout"
```

---

### Task 10: Integrate Logo Click into Header

**Files:**
- Modify: `src/app/components/layout/Header/index.tsx`

**Step 1: Update Header**

Add `useEasterEggs` context hook. Attach `onLogoClick` to the logo `Link`. Add `data-logo-glitch` attribute so the CSS effect from `LogoGlitch` applies.

Changes to make:
1. Import `useEasterEggs` from `EasterEggsContext`
2. Call `onLogoClick` in addition to existing logo Link behavior
3. Add `data-logo-glitch` attribute to the logo wrapper

```tsx
// In Header/index.tsx — add these changes:
// 1. Add import:
import { useEasterEggs } from "@/app/components/easter-eggs/EasterEggsContext";

// 2. Inside the component, add:
const { onLogoClick } = useEasterEggs();

// 3. Replace the Logo <Link> with:
<Link
  href={isHome ? "#hero" : "/"}
  className="block w-[8vw] tablet:w-[4vw] desktop:w-[1.8vw]"
  onClick={onLogoClick}
  data-logo-glitch
>
```

**Step 2: Commit**

```bash
git add src/app/components/layout/Header/index.tsx
git commit -m "feat(easter-eggs): integrate logo click easter egg into Header"
```

---

### Task 11: Integrate Hello Egg into HeroSection

**Files:**
- Modify: `src/app/_sections/portfolio/HeroSection/index.tsx`

**Step 1: Update HeroSection**

When `triggerHelloEgg` is true, temporarily override the greeting text passed to `AnimatedText`.

Changes:
1. Import `useEasterEggs`
2. Track an `overrideGreeting` state
3. When `triggerHelloEgg` changes to true, set override and revert after 3s

```tsx
// In HeroSection/index.tsx — add these changes:
// 1. Add import:
import { useEasterEggs } from "@/app/components/easter-eggs/EasterEggsContext";

// 2. Inside component, add after existing state:
const { triggerHelloEgg } = useEasterEggs();
const [overrideGreeting, setOverrideGreeting] = useState<string | null>(null);

useEffect(() => {
  if (triggerHelloEgg) {
    setOverrideGreeting("> console.log('Hello, curious visitor!')");
    const timer = setTimeout(() => setOverrideGreeting(null), 3000);
    return () => clearTimeout(timer);
  }
}, [triggerHelloEgg]);

// 3. In the AnimatedText component, change text prop:
<AnimatedText
  text={overrideGreeting ?? props.greeting}
  speed={40}
  onComplete={() => setTypewriterDone(true)}
/>
```

Note: Need to add `useEffect` to the existing import from "react" if not already there (it is already imported).

**Step 2: Commit**

```bash
git add src/app/_sections/portfolio/HeroSection/index.tsx
git commit -m "feat(easter-eggs): integrate hello egg into HeroSection typewriter"
```

---

### Task 12: Smoke Test + Verify

**Step 1: Run all tests**

Run: `npm test`
Expected: All tests pass (existing + new hook/console tests)

**Step 2: Run dev server and manually verify**

Run: `npm run dev`

Manual checklist:
- [ ] Page loads normally, no console errors (besides the styled easter egg message)
- [ ] Console shows the styled ASCII art message
- [ ] Typing Konami Code triggers Matrix rain, then secret message modal
- [ ] Secret message dismisses on click or Escape
- [ ] Clicking logo 5x rapidly triggers glitch animation
- [ ] Typing "hire" shows toast in bottom-right
- [ ] Typing "hello" retriggers hero typewriter with alternate greeting
- [ ] All existing functionality still works

**Step 3: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "feat(easter-eggs): final integration and fixes"
```

# Easter Eggs & Konami Code — Design Document

## Overview

Add hidden interactive easter eggs throughout the portfolio to delight visitors and make the site memorable. Four distinct triggers with unique visual effects, plus a styled console message for developers.

## Architecture

Single `EasterEggsProvider` client component wraps the app layout. Contains custom hooks for detection logic and effect components for visual output. Context exposes callbacks to existing components (Header logo, HeroSection typewriter).

### File Structure

```
src/app/components/easter-eggs/
  EasterEggsProvider.tsx        # Main provider — composes hooks, renders effects
  EasterEggsContext.ts          # Context definition
  hooks/
    useKonamiCode.ts            # Detects arrow+BA key sequence
    useSecretWord.ts            # Detects typed words ("hire", "hello")
  effects/
    MatrixRain.tsx              # Canvas-based falling characters overlay
    SecretMessage.tsx           # Modal after Matrix rain completes
    LogoGlitch.tsx              # CSS chromatic aberration on logo
    HireToast.tsx               # Bottom-right toast with contact link
  console-message.ts            # ASCII art + joke for dev console
```

### Integration Points

- **Root layout** (`src/app/(public)/layout.tsx`): Wrap children with `<EasterEggsProvider>`
- **Header logo**: Use context `onLogoClick` for click counting
- **HeroSection**: Use context callback to retrigger typewriter with alternate greeting

## Easter Eggs

### 1. Konami Code (up up down down left right left right B A)

**Detection:** `useKonamiCode` hook listens to `keydown`, tracks sequence buffer, fires callback on match.

**Effect:** Full-screen `<canvas>` overlay (`position: fixed`, `z-index: 50`, `pointer-events: none`). Green katakana + latin characters falling in columns. Fades out after ~4 seconds, then `SecretMessage` modal appears.

**Secret Message:** Centered modal with glassmorphic backdrop (blur + semi-transparent bg). Text: "You cracked the code! Here's a secret: I built this entire portfolio with Next.js, React & TypeScript. Feel free to explore the source." Dismissible via click or Escape key.

### 2. Logo Click Combo (5 rapid clicks)

**Detection:** Click counter in provider, resets after 2s of inactivity.

**Effect:** CSS `@keyframes` glitch animation on the logo — `clip-path` slicing + `text-shadow` with cyan/purple chromatic aberration. Duration: ~2 seconds. No layout shift.

### 3. Type "hire"

**Detection:** `useSecretWord` hook with `keydown` buffer matching.

**Effect:** Toast in bottom-right corner, slides up with spring animation. Accent-cyan border. Text: "Great choice! Let's talk" with arrow link to `#contact`. Auto-dismisses after 4 seconds or on click.

### 4. Type "hello"

**Detection:** Same `useSecretWord` hook, separate word.

**Effect:** Hero typewriter clears and retypes alternate greeting: `> console.log('Hello, curious visitor!')`. Reverts to original after 3 seconds.

### 5. Console Message (automatic)

**Trigger:** Fires once on provider mount.

**Output:**
```
SECURITY SCAN INITIATED...
100%
HACK DETECTED!

Just kidding — welcome, fellow developer!

Built with Next.js, React, TypeScript & curiosity.
Let's connect: linkedin.com/in/youssef-nesafe
```

## Testing Plan

- **Hooks:** Unit tests with `renderHook` — simulate keydown sequences, assert callbacks fire
- **Effects:** Render tests — verify mount/unmount, escape-to-dismiss, auto-dismiss timers
- **Console:** Test that message is logged on mount
- **Integration:** Provider renders children without breaking when no triggers activated

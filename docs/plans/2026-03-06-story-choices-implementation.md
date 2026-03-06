# Story Choices + Personality Result — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add branching choices (one per chapter) and a personality quiz result to the existing `/story` page.

**Architecture:** Each chapter's panel 2 (index 1) gains a choice with two options. Choosing an option stores the personality type and swaps panel 3's narration. After chapter 4, a fullscreen result card reveals the user's developer personality type. All content is dictionary-driven via `en.json`.

**Tech Stack:** React 19, TypeScript, Framer Motion, Tailwind CSS 4 (vw-based responsive), Next.js App Router

---

### Task 1: Add Interfaces to IStoryDictionary

**Files:**
- Modify: `src/app/models/IStoryDictionary.ts`

**Step 1: Add choice and personality interfaces**

Add these interfaces and modify existing ones:

```typescript
// Add after IStoryPanel
export interface IStoryChoiceOption {
  label: string;
  personality: string;
  followUp: string[];
}

export interface IStoryChoice {
  question: string;
  options: IStoryChoiceOption[];
}

export interface IStoryPersonality {
  id: string;
  title: string;
  color: string;
  description: string;
}
```

Modify `IStoryPanel` — add optional `choice`:
```typescript
export interface IStoryPanel {
  layout: "full" | "split" | "triple";
  background: "grid" | "dots" | "gradient" | "none";
  narration: string[];
  highlight?: string;
  visual: string;
  choice?: IStoryChoice;  // NEW
}
```

Modify `IStoryDictionary` — add `personalities` and `result`:
```typescript
export interface IStoryDictionary {
  title: string;
  subtitle: string;
  chapters: IStoryChapter[];
  nav: IStoryNav;
  personalities: IStoryPersonality[];  // NEW
  result: { title: string };           // NEW
}
```

**Step 2: Verify no type errors**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: Type errors in `en.json` usage (missing new fields) — that's expected until Task 2.

**Step 3: Commit**

```bash
git add src/app/models/IStoryDictionary.ts
git commit -m "feat(story): add choice and personality type interfaces"
```

---

### Task 2: Add Choice Content to en.json

**Files:**
- Modify: `src/dictionaries/en.json` (story section, lines ~405-565)

**Step 1: Add `choice` to each chapter's panel 2 (index 1)**

Chapter 1 — Origin, panel index 1 (`"visual": "browser-sketch"`):
```json
"choice": {
  "question": "What drew you to coding?",
  "options": [
    {
      "label": "The thrill of building something from nothing",
      "personality": "maverick",
      "followUp": [
        "That restless energy — the need to create, to ship, to see ideas come alive.",
        "It wasn't about perfection. It was about momentum."
      ]
    },
    {
      "label": "The puzzle of making things work",
      "personality": "architect",
      "followUp": [
        "The elegance of a well-designed system. The satisfaction of pieces clicking into place.",
        "Every problem was a blueprint waiting to be drawn."
      ]
    }
  ]
}
```

Chapter 2 — Arsenal, panel index 1 (`"visual": "skill-cards"`):
```json
"choice": {
  "question": "How do you pick your tools?",
  "options": [
    {
      "label": "Whatever solves the problem fastest",
      "personality": "explorer",
      "followUp": [
        "New framework? Let's try it. Unfamiliar territory? Even better.",
        "The best tool is the one that gets you to the answer."
      ]
    },
    {
      "label": "Master a few, deeply",
      "personality": "craftsman",
      "followUp": [
        "Depth over breadth. Knowing every edge case, every optimization.",
        "True mastery means the tool disappears — only the craft remains."
      ]
    }
  ]
}
```

Chapter 3 — Works, panel index 1 (`"visual": "browser-sketch"`):
```json
"choice": {
  "question": "What makes a project 'done'?",
  "options": [
    {
      "label": "When it ships and users love it",
      "personality": "maverick",
      "followUp": [
        "Done is better than perfect. Ship it, learn from it, iterate.",
        "The real test isn't the code review — it's the user's reaction."
      ]
    },
    {
      "label": "When every detail feels right",
      "personality": "craftsman",
      "followUp": [
        "That last 10% is what separates good from great.",
        "Every pixel, every transition, every interaction — all intentional."
      ]
    }
  ]
}
```

Chapter 4 — Vision, panel index 1 (`"visual": "tech-orbit"`):
```json
"choice": {
  "question": "What excites you about the future?",
  "options": [
    {
      "label": "New frontiers — AI, spatial computing, the unknown",
      "personality": "explorer",
      "followUp": [
        "The next decade will redefine what developers can build.",
        "And I want to be at the frontier, building what doesn't exist yet."
      ]
    },
    {
      "label": "Building systems that outlast trends",
      "personality": "architect",
      "followUp": [
        "Trends come and go. Good architecture endures.",
        "The future belongs to those who build foundations, not facades."
      ]
    }
  ]
}
```

**Step 2: Add `personalities` and `result` to the story object (after `nav`)**

```json
"personalities": [
  {
    "id": "architect",
    "title": "The Architect",
    "color": "#06B6D4",
    "description": "You see the big picture. Systems thinking, clean structure, and elegant solutions define your approach. You don't just write code — you design foundations that others build upon."
  },
  {
    "id": "explorer",
    "title": "The Explorer",
    "color": "#A855F7",
    "description": "Curiosity is your compass. You're always learning, always experimenting, always pushing into new territory. For you, the journey of discovery is the destination."
  },
  {
    "id": "craftsman",
    "title": "The Craftsman",
    "color": "#10B981",
    "description": "Details matter. You obsess over quality, polish every edge, and won't ship until it feels right. Your code isn't just functional — it's a work of art."
  },
  {
    "id": "maverick",
    "title": "The Maverick",
    "color": "gradient",
    "description": "You move fast and build boldly. While others deliberate, you ship. Your bias for action and fearless experimentation turn ideas into reality at breakneck speed."
  }
],
"result": {
  "title": "Your Developer DNA"
}
```

**Step 3: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/dictionaries/en.json','utf8')); console.log('Valid JSON')"`
Expected: "Valid JSON"

**Step 4: Commit**

```bash
git add src/dictionaries/en.json
git commit -m "feat(story): add choice content, personalities, and result text"
```

---

### Task 3: Add Choice Tracking to useStoryState

**Files:**
- Modify: `src/app/hooks/useStoryState.ts`

**Step 1: Add choice state and logic**

Add to imports:
```typescript
import type { IStoryChapter, IStoryPersonality } from "@/app/models/IStoryDictionary";
```

Add to `StoryState`:
```typescript
interface StoryState {
  chapterIndex: number;
  panelIndex: number;
  narrationComplete: boolean;
  isTransitioning: boolean;
  direction: Direction;
  choices: string[];       // NEW — personality id per chapter
  showResult: boolean;     // NEW — show result card after last chapter
}
```

Update initial state:
```typescript
const [state, setState] = useState<StoryState>({
  chapterIndex: 0,
  panelIndex: 0,
  narrationComplete: false,
  isTransitioning: false,
  direction: "forward",
  choices: [],
  showResult: false,
});
```

Add `makeChoice` callback:
```typescript
const makeChoice = useCallback((personality: string) => {
  setState((prev) => ({
    ...prev,
    choices: [...prev.choices, personality],
    panelIndex: prev.panelIndex + 1,
    narrationComplete: false,
    direction: "forward" as Direction,
  }));
}, []);
```

Add `selectedOption` getter — returns the option index chosen for the current chapter (for panel 3 followUp):
```typescript
const selectedChoice = state.choices[state.chapterIndex] ?? null;
```

Modify `goNext` — when story is complete, show result instead of navigating home:
Change the final `else` block from:
```typescript
router.push("/");
```
to:
```typescript
setState((prev) => ({ ...prev, showResult: true }));
```

Add `computeResult` function (accepts `personalities: IStoryPersonality[]`):
```typescript
const computeResult = useCallback(
  (personalities: IStoryPersonality[]): IStoryPersonality | null => {
    if (state.choices.length === 0) return null;
    const counts: Record<string, number> = {};
    state.choices.forEach((id) => {
      counts[id] = (counts[id] || 0) + 1;
    });
    let maxCount = 0;
    let winnerId = state.choices[state.choices.length - 1]; // recency tiebreak
    for (const [id, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        winnerId = id;
      }
    }
    return personalities.find((p) => p.id === winnerId) || null;
  },
  [state.choices]
);
```

Update the function signature to accept personalities too:
```typescript
export function useStoryState(chapters: IStoryChapter[]) {
```
Keep as-is — `computeResult` is called by the consumer with personalities.

Update return:
```typescript
return {
  ...state,
  currentChapter,
  totalPanels,
  globalPanelIndex,
  selectedChoice,
  goNext,
  goBack,
  makeChoice,
  skipNarration,
  onNarrationComplete,
  onTransitionEnd,
  computeResult,
};
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`

**Step 3: Commit**

```bash
git add src/app/hooks/useStoryState.ts
git commit -m "feat(story): add choice tracking and personality result to useStoryState"
```

---

### Task 4: Add Choice Buttons to SpeechBubble

**Files:**
- Modify: `src/app/(public)/story/components/SpeechBubble.tsx`

**Step 1: Add choice props and render choice buttons**

Update the interface:
```typescript
interface SpeechBubbleProps {
  lines: string[];
  skipToEnd: boolean;
  onComplete: () => void;
  accentColor: string;
  choice?: {
    question: string;
    options: { label: string; personality: string; followUp: string[] }[];
  };
  onChoice?: (personality: string) => void;
}
```

After the narration text div, add choice buttons (render only when `choice` and `onChoice` are provided, and narration is complete or skipped):
```tsx
{choice && onChoice && skipToEnd && (
  <div className="mt-[4.267vw] tablet:mt-[2vw] desktop:mt-[0.833vw] space-y-[2.667vw] tablet:space-y-[1.25vw] desktop:space-y-[0.521vw]">
    <p
      className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] font-semibold mb-[2.133vw] tablet:mb-[1vw] desktop:mb-[0.417vw]"
      style={{ color: accentColor }}
    >
      {choice.question}
    </p>
    {choice.options.map((opt) => (
      <button
        key={opt.personality}
        onClick={() => onChoice(opt.personality)}
        className="w-full text-left p-[3.2vw] tablet:p-[1.5vw] desktop:p-[0.625vw] rounded-[2.133vw] tablet:rounded-[1vw] desktop:rounded-[0.417vw] border border-border-subtle bg-bg-secondary/50 hover:bg-bg-tertiary/50 transition-colors text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-foreground cursor-pointer"
        style={{ borderColor: `${accentColor}30` }}
      >
        {opt.label}
      </button>
    ))}
  </div>
)}
```

Note: Show choice buttons only after narration completes (`skipToEnd` is true when `narrationComplete` is true from parent).

**Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`

**Step 3: Commit**

```bash
git add "src/app/(public)/story/components/SpeechBubble.tsx"
git commit -m "feat(story): add choice buttons to SpeechBubble"
```

---

### Task 5: Pass Choice Data Through ComicPanel and StoryChapter

**Files:**
- Modify: `src/app/(public)/story/components/ComicPanel.tsx`
- Modify: `src/app/(public)/story/components/StoryChapter.tsx`

**Step 1: Read ComicPanel.tsx to understand current props**

Read: `src/app/(public)/story/components/ComicPanel.tsx`

**Step 2: Add choice props to ComicPanel**

Add to `ComicPanelProps`:
```typescript
choice?: IStoryPanel["choice"];
onChoice?: (personality: string) => void;
```

Pass `choice` and `onChoice` to `SpeechBubble`:
```tsx
<SpeechBubble
  lines={panel.narration}
  skipToEnd={skipToEnd}
  onComplete={onNarrationComplete}
  accentColor={accentColor}
  choice={choice}
  onChoice={onChoice}
/>
```

**Step 3: Add choice props to StoryChapter**

Add to `StoryChapterProps`:
```typescript
choice?: IStoryPanel["choice"];
onChoice?: (personality: string) => void;
```

Pass to `ComicPanel`:
```tsx
<ComicPanel
  panel={panel}
  accentColor={accentColor}
  skipToEnd={narrationComplete}
  onNarrationComplete={onNarrationComplete}
  choice={panel.choice}
  onChoice={onChoice}
/>
```

Do this for all three layout variants (full, split, triple) — only the first `ComicPanel` in split/triple gets choice props.

**Step 4: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`

**Step 5: Commit**

```bash
git add "src/app/(public)/story/components/ComicPanel.tsx" "src/app/(public)/story/components/StoryChapter.tsx"
git commit -m "feat(story): thread choice props through ComicPanel and StoryChapter"
```

---

### Task 6: Handle Follow-Up Narration for Panel 3

**Files:**
- Modify: `src/app/(public)/story/components/StoryChapter.tsx`

**Step 1: Add `selectedChoice` prop to StoryChapter**

```typescript
interface StoryChapterProps {
  chapter: IStoryChapter;
  panelIndex: number;
  direction: Direction;
  accentColor: string;
  narrationComplete: boolean;
  onNarrationComplete: () => void;
  onChoice?: (personality: string) => void;
  selectedChoice: string | null;  // personality id chosen for this chapter
}
```

**Step 2: Override panel 3 narration when a choice was made**

Before rendering, compute effective panel narration:
```typescript
const panel = chapter.panels[panelIndex];

// If this is panel 3 (index 2) and a choice was made, use followUp narration
let effectiveNarration = panel.narration;
if (panelIndex === 2 && selectedChoice) {
  const choicePanel = chapter.panels[1]; // panel 2 has the choice
  if (choicePanel.choice) {
    const chosen = choicePanel.choice.options.find(
      (opt) => opt.personality === selectedChoice
    );
    if (chosen) {
      effectiveNarration = chosen.followUp;
    }
  }
}
```

Pass `effectiveNarration` instead of `panel.narration` to `ComicPanel`. This means `ComicPanel` needs a `narrationOverride` prop OR we create a modified panel object:
```typescript
const effectivePanel = { ...panel, narration: effectiveNarration };
```

Then pass `effectivePanel` to `ComicPanel` instead of `panel`.

**Step 3: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`

**Step 4: Commit**

```bash
git add "src/app/(public)/story/components/StoryChapter.tsx"
git commit -m "feat(story): override panel 3 narration with choice followUp"
```

---

### Task 7: Create ResultCard Component

**Files:**
- Create: `src/app/(public)/story/components/ResultCard.tsx`

**Step 1: Create the component**

```tsx
"use client";

import { motion } from "framer-motion";
import type { IStoryPersonality } from "@/app/models/IStoryDictionary";

interface ResultCardProps {
  personality: IStoryPersonality;
  resultTitle: string;
  onBack: () => void;
}

const GRADIENT_COLOR = "linear-gradient(135deg, #06B6D4 0%, #A855F7 100%)";

export default function ResultCard({
  personality,
  resultTitle,
  onBack,
}: ResultCardProps) {
  const isGradient = personality.color === "gradient";
  const titleStyle = isGradient
    ? {
        background: GRADIENT_COLOR,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }
    : { color: personality.color };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
    >
      <div className="text-center max-w-[85vw] tablet:max-w-[50vw] desktop:max-w-[26.042vw]">
        <p className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-text-muted uppercase tracking-widest mb-[2.667vw] tablet:mb-[1.25vw] desktop:mb-[0.521vw]">
          {resultTitle}
        </p>

        <h1
          className="text-[10.667vw] tablet:text-[6vw] desktop:text-[3.333vw] font-bold leading-[1.1] mb-[4.267vw] tablet:mb-[2vw] desktop:mb-[0.833vw]"
          style={titleStyle}
        >
          {personality.title}
        </h1>

        <p className="text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] text-foreground leading-[1.7] mb-[8.533vw] tablet:mb-[4vw] desktop:mb-[1.667vw]">
          {personality.description}
        </p>

        <button
          onClick={onBack}
          className="btn-gradient text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] font-semibold text-white px-[8.533vw] tablet:px-[4vw] desktop:px-[1.667vw] py-[3.2vw] tablet:py-[1.5vw] desktop:py-[0.625vw] rounded-[2.667vw] tablet:rounded-[1.25vw] desktop:rounded-[0.521vw] cursor-pointer"
        >
          Back to Portfolio
        </button>
      </div>
    </motion.div>
  );
}
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`

**Step 3: Commit**

```bash
git add "src/app/(public)/story/components/ResultCard.tsx"
git commit -m "feat(story): create ResultCard component for personality reveal"
```

---

### Task 8: Wire Everything Together in StoryPage

**Files:**
- Modify: `src/app/(public)/story/components/StoryPage.tsx`

**Step 1: Import ResultCard and pass new props**

Add import:
```typescript
import ResultCard from "./ResultCard";
```

Destructure new values from `useStoryState`:
```typescript
const {
  chapterIndex,
  panelIndex,
  narrationComplete,
  isTransitioning,
  direction,
  currentChapter,
  totalPanels,
  globalPanelIndex,
  selectedChoice,
  showResult,
  goNext,
  goBack,
  makeChoice,
  onNarrationComplete,
  onTransitionEnd,
  computeResult,
} = useStoryState(story.chapters);
```

**Step 2: Compute result and render ResultCard**

After the hook destructure:
```typescript
const resultPersonality = computeResult(story.personalities);
```

After the `ChapterTransition` component, add:
```tsx
{showResult && resultPersonality && (
  <ResultCard
    personality={resultPersonality}
    resultTitle={story.result.title}
    onBack={() => router.push("/")}
  />
)}
```

Add router import at top:
```typescript
import { useRouter } from "next/navigation";
```

Add in component:
```typescript
const router = useRouter();
```

**Step 3: Pass choice props to StoryChapter**

```tsx
<StoryChapter
  chapter={currentChapter}
  panelIndex={panelIndex}
  direction={direction}
  accentColor={accentColor}
  narrationComplete={narrationComplete}
  onNarrationComplete={onNarrationComplete}
  onChoice={makeChoice}
  selectedChoice={selectedChoice}
/>
```

**Step 4: Hide Next button on choice panels**

On choice panels (panels with `choice` data and no choice made yet), the Next button should be hidden — the user advances by making a choice.

In StoryPage, determine if current panel is a choice panel:
```typescript
const currentPanel = currentChapter.panels[panelIndex];
const isChoicePanel = !!currentPanel.choice && !selectedChoice;
```

Wait — `selectedChoice` is for the current chapter. If the user hasn't chosen yet for this chapter and this panel has a choice, hide Next. But the choice array length tells us if this chapter's choice has been made:
```typescript
const isChoicePanel = !!currentPanel.choice && state.choices.length <= chapterIndex;
```

Actually, use `selectedChoice` which is `state.choices[state.chapterIndex] ?? null`:
```typescript
const isChoicePanel = !!currentPanel.choice && !selectedChoice;
```

Pass to StoryNav (or conditionally render):
```tsx
{!isChoicePanel && (
  <div className="mt-[6.4vw] tablet:mt-[3vw] desktop:mt-[1.25vw] w-full max-w-[90vw] tablet:max-w-[60vw] desktop:max-w-[41.667vw]">
    <StoryNav ... />
  </div>
)}
```

Actually, better: always show nav but disable/hide Next when it's a choice panel. Simplest: just wrap the nav div with the condition.

**Step 5: Verify compilation**

Run: `npx tsc --noEmit 2>&1 | head -20`

**Step 6: Commit**

```bash
git add "src/app/(public)/story/components/StoryPage.tsx"
git commit -m "feat(story): wire choice state, result card, and conditional nav in StoryPage"
```

---

### Task 9: Verify Full Flow

**Step 1: Run dev server**

Run: `npm run dev`

**Step 2: Test in browser with Playwright**

Navigate to `/story`, click through all panels:
- Chapter 1: Panel 1 (narrate) → Panel 2 (read narration, choose option) → Panel 3 (verify followUp text)
- Repeat for chapters 2-4
- After chapter 4 panel 3: Next → Result card appears
- Verify personality title and description match choices
- Click "Back to Portfolio" → navigates home

**Step 3: Test edge cases**
- Go back from panel 3 to panel 2 — choice should already be made, buttons should not reappear
- Verify progress bar still works correctly

**Step 4: Run build**

Run: `npm run build 2>&1 | tail -20`

**Step 5: Run lint**

Run: `npm run lint`

**Step 6: Final commit if any fixes needed**

---

## Verification Checklist

- [ ] TypeScript compiles without new errors
- [ ] Each chapter panel 2 shows choice buttons after narration
- [ ] Clicking a choice advances to panel 3 with correct followUp text
- [ ] Next button hidden on choice panels (user must pick)
- [ ] Back button from panel 3 goes to panel 2 (choice already made, no re-pick)
- [ ] Result card appears after final panel with correct personality
- [ ] "Back to Portfolio" button works
- [ ] Progress bar and chapter transitions still work
- [ ] Mobile responsive layout intact

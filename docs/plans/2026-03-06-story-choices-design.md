# Interactive Story Choices + Personality Result — Design

## Overview

Enhance the existing `/story` page with branching choices and a personality result. Each of the 4 chapters has one choice point (panel 2) that changes the follow-up narration (panel 3). After all 4 chapters, a result card reveals the user's "developer personality" type.

## Choice System

- Each chapter: Panel 1 (intro) → Panel 2 (choice) → Panel 3 (branching narration)
- Choice appears as two buttons inside the speech bubble
- Same visual on panel 3 regardless of choice — only narration text changes
- 4 choices total, one per chapter

## Personality Types

| Type | Color | Description |
|------|-------|-------------|
| The Architect | cyan | Systems thinker, loves clean structure |
| The Explorer | purple | Curiosity-driven, always learning |
| The Craftsman | emerald | Detail-obsessed, pixel-perfect quality |
| The Maverick | cyan→purple gradient | Moves fast, ships boldly |

## Scoring

- Each choice maps to a personality type
- Track selections in an array
- Most-picked type wins; ties broken by last choice (recency)

## Choice Content

### Chapter 1 — The Origin
> "What drew you to coding?"
- "The thrill of building something from nothing" → Maverick
- "The puzzle of making things work" → Architect

### Chapter 2 — The Arsenal
> "How do you pick your tools?"
- "Whatever solves the problem fastest" → Explorer
- "Master a few, deeply" → Craftsman

### Chapter 3 — The Works
> "What makes a project 'done'?"
- "When it ships and users love it" → Maverick
- "When every detail feels right" → Craftsman

### Chapter 4 — The Vision
> "What excites you about the future?"
- "New frontiers — AI, spatial computing, the unknown" → Explorer
- "Building systems that outlast trends" → Architect

## Branching Narration

Each choice option has a `followUp` narration array that replaces panel 3's narration text. Same visual, different words.

## Result Card

After chapter 4's final panel, a fullscreen result card shows:
- Personality type name (large, gradient text matching type color)
- Description paragraph
- Simple icon/visual for the type
- "Back to Portfolio" button

## Data Structure

```typescript
interface IStoryChoice {
  question: string;
  options: {
    label: string;
    personality: string;
    followUp: string[];
  }[];
}

interface IStoryPersonality {
  id: string;
  title: string;
  color: string;
  description: string;
}
```

Chapters gain optional `choice?: IStoryChoice`. Dictionary gains `personalities: IStoryPersonality[]` and `result: { title: string }`.

## Files Changed

- `IStoryDictionary.ts` — New interfaces
- `en.json` — Choice content + personalities
- `useStoryState.ts` — Track choices, compute result
- `SpeechBubble.tsx` — Render choice buttons
- `StoryPage.tsx` — Pass choice state, render result
- `ResultCard.tsx` — New component for personality reveal

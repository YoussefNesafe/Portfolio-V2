# Dragon Ball Story Mode — Design

## Concept

A 2D side-scrolling experience where a pixel-art character named Youssef walks through a continuous landscape using arrow keys. The world gradually transitions through 4 biomes representing career chapters. Story text floats in the sky/background as part of the environment. Heavy Dragon Ball anime theming throughout.

Desktop-only. No interactive choices — pure cinematic walking experience.

## Visual Theme

### Color Palette (Dragon Ball inspired)

- Sky/background: Deep navy to orange sunset gradients (iconic DB sky)
- Primary orange: `#FF6B00` (Goku gi)
- Ki yellow: `#FFD700` (energy/aura)
- Ki blue: `#00BFFF` (super saiyan blue vibes)
- Power purple: `#A855F7` (aura/transformation)
- Namek green: `#10B981` (environment)
- Ground/earth tones: browns, dark greens for terrain
- Base/space sections: `#0A0A0F`

### Youssef Character (Pixel Art)

- ~32x32 pixel sprite
- Orange gi with blue undershirt (classic Goku palette)
- Dark hair
- Animations: idle (2 frames breathing), walk right (4 frames), walk left (4 frames mirrored)
- Constant subtle aura glow — cyan/purple energy particles trailing behind

### HUD

- Scouter/Power Level — top-right corner. Small scouter graphic with a number that increases as progress increases (starts at 0, ends at 9001+). Replaces the old progress bar.
- Minimal — no other UI clutter.

## World Layout

One long horizontal strip. As Youssef walks right, the background parallax-scrolls at different speeds across 4-5 layers:

| Layer | Speed | Content |
|-------|-------|---------|
| Sky (back) | 0.1x | Gradient sky, clouds, floating story text |
| Mountains | 0.3x | Distant terrain, Dragon Balls scattered decoratively |
| Mid-ground | 0.6x | Trees, buildings, chapter-specific landmarks |
| Ground | 1.0x | Terrain Youssef walks on |
| Foreground | 1.2x | Grass, particles, ki energy effects |

### 4 Biomes (smooth transitions)

**1. The Origin — Training Grounds**
- Rocky mountain terrain (like Goku's training area)
- Waterfall in background, stone path
- Floating text: career origin story
- Senzu bean plant near the start
- Color: warm earth tones, orange sky

**2. The Arsenal — Tech Dojo**
- Transitions to a Capsule Corp-style tech building area
- Floating holographic signs with tech names (React, TypeScript, etc.)
- Nimbus cloud floats by in the background
- Ki blast particles in the air
- Color: shifts toward cyan/blue

**3. The Works — Tournament Arena**
- World Tournament stage vibes
- Project names on banners/flags in the background
- Crowd silhouettes in the distance
- Dragon Balls visible scattered in the sky (decorative)
- Power-up moment: brief transformation aura burst at entry
- Color: emerald/green arena

**4. The Vision — Hyperbolic Time Chamber / Space**
- Environment opens up to a vast horizon/space
- Stars, nebula, limitless feel
- Final story text floats in the cosmos
- Power level scouter reaches "9001+" with a flash
- Senzu bean at the very end (decorative)
- Color: deep purple to dark background

## Mechanics

### Movement

- Arrow Right: Youssef walks right, world scrolls left
- Arrow Left: Youssef walks left, world scrolls right
- Youssef stays roughly center-screen horizontally
- Smooth acceleration/deceleration (not instant start/stop)
- Walk speed: comfortable reading pace

### Story Text in Environment

- Text rendered as pixel-font strings floating in the sky layer
- Fades in as you approach, fades out as you pass
- Key phrases get a glow effect (like ki energy)
- Chapter titles appear as large kanji-style text on mountains/structures
- Text is spaced so you naturally read it at walking pace

### Power-Up Transitions

At each biome boundary, a brief transformation animation:
- Screen flashes white
- Aura intensifies (more particles, brighter glow)
- Scouter power level jumps
- ~1 second, non-blocking (you keep walking)

### Start and End

- Start: Youssef appears on the left. A "Press arrow-right to begin" prompt with Dragon Ball font styling.
- End: Walking to the far right triggers a final screen — power level maxes out, "Thanks for reading my story. Now, let's build something together." with a link back to portfolio.

## Dragon Ball Elements

1. Youssef wears a gi (orange with blue undershirt)
2. Aura effect — glowing energy particles trailing behind while walking
3. Power-up moment — transformation animation at chapter transitions
4. Nimbus cloud — floats by in the background (Tech Dojo biome)
5. Dragon Balls — scattered decoratively in the sky/background
6. Ki blasts / energy effects — ambient particles in the environment
7. Scouter/power level — HUD element showing progress as a power level number
8. Senzu beans — decorative items near start and end

## Technical Approach

### Rendering

- HTML Canvas for the game world (character, parallax layers, particles)
- Wrap in a React component with `useRef` + `useEffect` for the game loop
- `requestAnimationFrame` for smooth 60fps rendering

### Architecture (new files)

- `StoryCanvas.tsx` — main canvas component, game loop
- `useGameLoop.ts` — handles RAF, delta time, update/render cycle
- `usePlayerInput.ts` — arrow key listeners, velocity state
- `sprite-data.ts` — pixel art defined as 2D arrays of color values
- `world-data.ts` — biome definitions, text positions, decoration placements
- `parallax.ts` — layer rendering with scroll speed multipliers
- Story content stays in `en.json` dictionary (rewritten for DB narrative style)

### Files to Remove

- `ComicPanel.tsx` — replaced by canvas rendering
- `SpeechBubble.tsx` — replaced by floating text in environment
- `PanelVisual.tsx` (32KB SVG art) — replaced by pixel art sprites
- `StoryChapter.tsx` — replaced by continuous scroll
- `StoryNav.tsx` — replaced by arrow key movement
- `StoryProgress.tsx` — replaced by scouter HUD
- `ChapterTransition.tsx` — replaced by power-up animations
- `ResultCard.tsx` — replaced by end-of-world final screen
- `useStoryState.ts` — replaced by game loop hooks
- Choice/personality interfaces from `IStoryDictionary.ts`
- Choice/personality data from `en.json`

### Files to Keep (modified)

- `StoryButton.tsx` — update icon/style to match DB theme
- `IStoryDictionary.ts` — rewrite interfaces for new data shape
- `en.json` story section — rewrite content in DB narrative style
- `page.tsx` — update to use new StoryCanvas component

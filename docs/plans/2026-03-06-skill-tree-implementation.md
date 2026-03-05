# Skill Tree Visualization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the existing Skills section badge grid with an interactive, RPG-inspired radial skill tree with three experience tiers, SVG connections, and hover interactions.

**Architecture:** Pure layout functions compute node positions (radial for desktop, vertical for mobile). SVG paths connect nodes with glowing bezier curves. React components render nodes with Framer Motion entry animations and CSS hover effects. Data comes from the existing dictionary with an added `tier` field per skill.

**Tech Stack:** React 19, TypeScript, SVG, Framer Motion, Tailwind CSS 4, Vitest

---

### Task 1: Add tier field to Skill type and dictionary data

**Files:**
- Modify: `src/app/models/common/index.ts:25-30`
- Modify: `src/dictionaries/en.json:208-282`

**Step 1: Add `tier` to the `Skill` interface**

In `src/app/models/common/index.ts`, update the Skill interface:

```typescript
export type SkillTier = "expert" | "proficient" | "familiar";

export interface Skill {
  name: string;
  icon: string;
  color: string;
  tier?: SkillTier;
}
```

**Step 2: Add tier values to every skill in `src/dictionaries/en.json`**

For each skill object in the `skills.categories` array, add the `tier` field:

**Frontend:**
- React: `"tier": "expert"`
- Next.js: `"tier": "expert"`
- Vue.js: `"tier": "proficient"`
- TypeScript: `"tier": "expert"`
- JavaScript: `"tier": "expert"`

**State & Data:**
- GraphQL: `"tier": "proficient"`
- Apollo Client: `"tier": "proficient"`
- React Query: `"tier": "proficient"`
- Zustand: `"tier": "familiar"`
- Redux: `"tier": "proficient"`
- REST APIs: `"tier": "proficient"`
- WebSocket: `"tier": "familiar"`

**Styling & UI:**
- Tailwind CSS: `"tier": "expert"`
- Material-UI: `"tier": "proficient"`
- Quasar: `"tier": "familiar"`
- Vuetify: `"tier": "familiar"`
- SASS/SCSS: `"tier": "expert"`

**Testing:**
- Jest: `"tier": "proficient"`
- Cypress: `"tier": "proficient"`
- Testing Library: `"tier": "proficient"`

**DevOps & Tools:**
- Git: `"tier": "expert"`
- Docker: `"tier": "proficient"`
- GitHub Actions: `"tier": "familiar"`
- Webpack: `"tier": "familiar"`
- Vite: `"tier": "proficient"`

**Step 3: Run build to verify types**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds (no type errors)

**Step 4: Commit**

```bash
git add src/app/models/common/index.ts src/dictionaries/en.json
git commit -m "feat(skill-tree): add tier field to Skill type and dictionary data"
```

---

### Task 2: Pure layout functions with tests

**Files:**
- Create: `src/app/components/skill-tree/layout.ts`
- Create: `src/app/components/skill-tree/__tests__/layout.test.ts`

**Context:** These pure functions compute x/y positions for all nodes. They take container dimensions and skill data as input, return node positions and connection paths. This is the core math — tested thoroughly, no React needed.

**Step 1: Write failing tests for `computeRadialLayout`**

Create `src/app/components/skill-tree/__tests__/layout.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  computeRadialLayout,
  computeVerticalLayout,
  computeConnectionPath,
  type LayoutNode,
  type LayoutConnection,
} from "../layout";

const MOCK_CATEGORIES = [
  {
    name: "Frontend",
    skills: [
      { name: "React", icon: "SiReact", color: "#61DAFB", tier: "expert" as const },
      { name: "Vue.js", icon: "SiVuedotjs", color: "#4FC08D", tier: "proficient" as const },
    ],
  },
  {
    name: "Testing",
    skills: [
      { name: "Jest", icon: "SiJest", color: "#C21325", tier: "proficient" as const },
    ],
  },
];

describe("computeRadialLayout", () => {
  it("returns a core node at the center", () => {
    const result = computeRadialLayout(MOCK_CATEGORIES, 800, 600);
    const core = result.nodes.find((n) => n.type === "core");
    expect(core).toBeDefined();
    expect(core!.x).toBe(400);
    expect(core!.y).toBe(300);
  });

  it("returns one category node per category", () => {
    const result = computeRadialLayout(MOCK_CATEGORIES, 800, 600);
    const categories = result.nodes.filter((n) => n.type === "category");
    expect(categories).toHaveLength(2);
  });

  it("returns one skill node per skill", () => {
    const result = computeRadialLayout(MOCK_CATEGORIES, 800, 600);
    const skills = result.nodes.filter((n) => n.type === "skill");
    expect(skills).toHaveLength(3);
  });

  it("returns connections from core to categories and categories to skills", () => {
    const result = computeRadialLayout(MOCK_CATEGORIES, 800, 600);
    // 2 core->category + 2 category->skill (Frontend) + 1 category->skill (Testing) = 5
    expect(result.connections).toHaveLength(5);
  });

  it("places category nodes at equal angles around center", () => {
    const result = computeRadialLayout(MOCK_CATEGORIES, 800, 600);
    const categories = result.nodes.filter((n) => n.type === "category");
    // With 2 categories, they should be 180 degrees apart (pi radians)
    const dx = categories[1].x - categories[0].x;
    const dy = categories[1].y - categories[0].y;
    // They should be on opposite sides of center
    const cx = 400;
    const cy = 300;
    const angle0 = Math.atan2(categories[0].y - cy, categories[0].x - cx);
    const angle1 = Math.atan2(categories[1].y - cy, categories[1].x - cx);
    const diff = Math.abs(angle1 - angle0);
    expect(diff).toBeCloseTo(Math.PI, 1);
  });

  it("skill nodes include tier information", () => {
    const result = computeRadialLayout(MOCK_CATEGORIES, 800, 600);
    const react = result.nodes.find((n) => n.label === "React");
    expect(react?.tier).toBe("expert");
  });
});

describe("computeVerticalLayout", () => {
  it("returns a core node at the top center", () => {
    const result = computeVerticalLayout(MOCK_CATEGORIES, 375);
    const core = result.nodes.find((n) => n.type === "core");
    expect(core).toBeDefined();
    expect(core!.x).toBeCloseTo(187.5);
    expect(core!.y).toBeLessThan(100);
  });

  it("places categories below the core vertically", () => {
    const result = computeVerticalLayout(MOCK_CATEGORIES, 375);
    const core = result.nodes.find((n) => n.type === "core")!;
    const categories = result.nodes.filter((n) => n.type === "category");
    categories.forEach((cat) => {
      expect(cat.y).toBeGreaterThan(core.y);
    });
  });

  it("places skills to the right of their category", () => {
    const result = computeVerticalLayout(MOCK_CATEGORIES, 375);
    const categories = result.nodes.filter((n) => n.type === "category");
    const skills = result.nodes.filter((n) => n.type === "skill");
    // Each skill's x should be greater than its category's x
    skills.forEach((skill) => {
      const parentCat = categories.find((c) => c.id === skill.parentId);
      expect(skill.x).toBeGreaterThan(parentCat!.x);
    });
  });

  it("returns the total computed height", () => {
    const result = computeVerticalLayout(MOCK_CATEGORIES, 375);
    expect(result.totalHeight).toBeGreaterThan(0);
  });
});

describe("computeConnectionPath", () => {
  it("returns a valid SVG quadratic bezier path string", () => {
    const path = computeConnectionPath(
      { x: 100, y: 100 },
      { x: 200, y: 200 }
    );
    expect(path).toMatch(/^M\s*[\d.]+[\s,][\d.]+\s*Q\s*[\d.]+[\s,][\d.]+[\s,][\d.]+[\s,][\d.]+$/);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/app/components/skill-tree/__tests__/layout.test.ts`
Expected: FAIL — module not found

**Step 3: Implement layout functions**

Create `src/app/components/skill-tree/layout.ts`:

```typescript
import type { Skill, SkillTier, SkillCategory } from "@/app/models/common";

export interface LayoutNode {
  id: string;
  type: "core" | "category" | "skill";
  x: number;
  y: number;
  label: string;
  icon?: string;
  color?: string;
  tier?: SkillTier;
  parentId?: string;
  categoryIndex?: number;
}

export interface LayoutConnection {
  id: string;
  fromId: string;
  toId: string;
  path: string;
  color: string;
}

export interface TreeLayout {
  nodes: LayoutNode[];
  connections: LayoutConnection[];
  totalHeight?: number;
}

export function computeConnectionPath(
  from: { x: number; y: number },
  to: { x: number; y: number }
): string {
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2;
  return `M ${from.x},${from.y} Q ${cx},${from.y} ${to.x},${to.y}`;
}

export function computeRadialLayout(
  categories: SkillCategory[],
  width: number,
  height: number
): TreeLayout {
  const cx = width / 2;
  const cy = height / 2;
  const categoryRadius = Math.min(width, height) * 0.3;
  const skillRadius = Math.min(width, height) * 0.45;
  const angleStep = (2 * Math.PI) / categories.length;
  // Start from top (-PI/2)
  const startAngle = -Math.PI / 2;

  const nodes: LayoutNode[] = [];
  const connections: LayoutConnection[] = [];

  // Core node
  nodes.push({
    id: "core",
    type: "core",
    x: cx,
    y: cy,
    label: "Core",
  });

  categories.forEach((cat, catIdx) => {
    const catAngle = startAngle + catIdx * angleStep;
    const catX = cx + categoryRadius * Math.cos(catAngle);
    const catY = cy + categoryRadius * Math.sin(catAngle);
    const catId = `cat-${catIdx}`;

    nodes.push({
      id: catId,
      type: "category",
      x: catX,
      y: catY,
      label: cat.name,
      categoryIndex: catIdx,
    });

    connections.push({
      id: `core-${catId}`,
      fromId: "core",
      toId: catId,
      path: computeConnectionPath({ x: cx, y: cy }, { x: catX, y: catY }),
      color: cat.skills[0]?.color ?? "#06B6D4",
    });

    // Fan skills around the category node
    const skillAngleSpread = angleStep * 0.6;
    const skillStartAngle = catAngle - skillAngleSpread / 2;
    const skillStep =
      cat.skills.length > 1
        ? skillAngleSpread / (cat.skills.length - 1)
        : 0;

    cat.skills.forEach((skill, skillIdx) => {
      const sAngle =
        cat.skills.length === 1
          ? catAngle
          : skillStartAngle + skillIdx * skillStep;
      const sX = cx + skillRadius * Math.cos(sAngle);
      const sY = cy + skillRadius * Math.sin(sAngle);
      const skillId = `skill-${catIdx}-${skillIdx}`;

      nodes.push({
        id: skillId,
        type: "skill",
        x: sX,
        y: sY,
        label: skill.name,
        icon: skill.icon,
        color: skill.color,
        tier: skill.tier,
        parentId: catId,
        categoryIndex: catIdx,
      });

      connections.push({
        id: `${catId}-${skillId}`,
        fromId: catId,
        toId: skillId,
        path: computeConnectionPath({ x: catX, y: catY }, { x: sX, y: sY }),
        color: skill.color,
      });
    });
  });

  return { nodes, connections };
}

export function computeVerticalLayout(
  categories: SkillCategory[],
  width: number
): TreeLayout {
  const nodes: LayoutNode[] = [];
  const connections: LayoutConnection[] = [];
  const coreX = width / 2;
  const coreY = 40;
  const categoryX = width * 0.25;
  const skillStartX = width * 0.5;
  const categoryGap = 120;
  const skillGapY = 50;
  const skillGapX = 40;

  nodes.push({
    id: "core",
    type: "core",
    x: coreX,
    y: coreY,
    label: "Core",
  });

  let currentY = coreY + 80;

  categories.forEach((cat, catIdx) => {
    const catId = `cat-${catIdx}`;
    const catY = currentY;

    nodes.push({
      id: catId,
      type: "category",
      x: categoryX,
      y: catY,
      label: cat.name,
      categoryIndex: catIdx,
    });

    connections.push({
      id: `core-${catId}`,
      fromId: "core",
      toId: catId,
      path: computeConnectionPath({ x: coreX, y: coreY }, { x: categoryX, y: catY }),
      color: cat.skills[0]?.color ?? "#06B6D4",
    });

    cat.skills.forEach((skill, skillIdx) => {
      const skillId = `skill-${catIdx}-${skillIdx}`;
      const sX = skillStartX + (skillIdx % 3) * skillGapX;
      const sY = catY + Math.floor(skillIdx / 3) * skillGapY;

      nodes.push({
        id: skillId,
        type: "skill",
        x: sX,
        y: sY,
        label: skill.name,
        icon: skill.icon,
        color: skill.color,
        tier: skill.tier,
        parentId: catId,
        categoryIndex: catIdx,
      });

      connections.push({
        id: `${catId}-${skillId}`,
        fromId: catId,
        toId: skillId,
        path: computeConnectionPath({ x: categoryX, y: catY }, { x: sX, y: sY }),
        color: skill.color,
      });
    });

    const rows = Math.ceil(cat.skills.length / 3);
    currentY += Math.max(rows * skillGapY, categoryGap);
  });

  return { nodes, connections, totalHeight: currentY + 40 };
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/app/components/skill-tree/__tests__/layout.test.ts`
Expected: All 11 tests pass

**Step 5: Commit**

```bash
git add src/app/components/skill-tree/layout.ts src/app/components/skill-tree/__tests__/layout.test.ts
git commit -m "feat(skill-tree): add pure layout functions with tests"
```

---

### Task 3: SkillTreeNode component

**Files:**
- Create: `src/app/components/skill-tree/SkillTreeNode.tsx`

**Context:** Renders a single node (core, category, or skill). Positioned absolutely using x/y from layout. Handles hover state, renders SimpleIcon for skills. Styled differently per tier. The component receives `onHover` and `onLeave` callbacks for parent coordination.

**Step 1: Create the SkillTreeNode component**

Create `src/app/components/skill-tree/SkillTreeNode.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import type { LayoutNode } from "./layout";
import type { SkillTier } from "@/app/models/common";
import type { IconType } from "react-icons";
import * as SiIcons from "react-icons/si";

const iconMap = SiIcons as unknown as Record<string, IconType>;

const tierStyles: Record<
  SkillTier,
  { border: string; glow: string; opacity: string; borderStyle: string }
> = {
  expert: {
    border: "border-[0.267vw] tablet:border-[0.125vw] desktop:border-[0.104vw]",
    glow: "shadow-[0_0_12px_var(--node-color)]",
    opacity: "opacity-100",
    borderStyle: "border-solid",
  },
  proficient: {
    border: "border-[0.133vw] tablet:border-[0.063vw] desktop:border-[0.052vw]",
    glow: "shadow-[0_0_6px_var(--node-color)]",
    opacity: "opacity-90",
    borderStyle: "border-solid",
  },
  familiar: {
    border: "border-[0.133vw] tablet:border-[0.063vw] desktop:border-[0.052vw]",
    glow: "",
    opacity: "opacity-60",
    borderStyle: "border-dashed",
  },
};

interface SkillTreeNodeProps {
  node: LayoutNode;
  isHighlighted: boolean;
  isDimmed: boolean;
  onHover: (nodeId: string) => void;
  onLeave: () => void;
  animationDelay: number;
}

export default function SkillTreeNode({
  node,
  isHighlighted,
  isDimmed,
  onHover,
  onLeave,
  animationDelay,
}: SkillTreeNodeProps) {
  const Icon = node.icon ? iconMap[node.icon] : null;

  if (node.type === "core") {
    return (
      <motion.div
        className="absolute flex items-center justify-center rounded-full bg-background border-[0.267vw] tablet:border-[0.125vw] desktop:border-[0.104vw] border-accent-cyan shadow-[0_0_20px_theme(colors.accent-cyan)] w-[16vw] h-[16vw] tablet:w-[7.5vw] tablet:h-[7.5vw] desktop:w-[3.646vw] desktop:h-[3.646vw] cursor-pointer z-10"
        style={{
          left: `${node.x}px`,
          top: `${node.y}px`,
          transform: "translate(-50%, -50%)",
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.3, delay: animationDelay }}
        onMouseEnter={() => onHover(node.id)}
        onMouseLeave={onLeave}
      >
        <span className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] font-mono font-bold text-accent-cyan">
          {"</>"}
        </span>
      </motion.div>
    );
  }

  if (node.type === "category") {
    return (
      <motion.div
        className={`absolute flex items-center justify-center rounded-full bg-bg-secondary border-[0.267vw] tablet:border-[0.125vw] desktop:border-[0.104vw] border-accent-purple w-[13.333vw] h-[13.333vw] tablet:w-[6.25vw] tablet:h-[6.25vw] desktop:w-[2.604vw] desktop:h-[2.604vw] cursor-pointer z-10 transition-opacity duration-300 ${isDimmed ? "opacity-30" : "opacity-100"}`}
        style={{
          left: `${node.x}px`,
          top: `${node.y}px`,
          transform: "translate(-50%, -50%)",
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.3, delay: animationDelay }}
        onMouseEnter={() => onHover(node.id)}
        onMouseLeave={onLeave}
      >
        <span className="text-[2.133vw] tablet:text-[1vw] desktop:text-[0.417vw] font-mono text-accent-purple text-center leading-tight px-[0.533vw] tablet:px-[0.25vw] desktop:px-[0.104vw]">
          {node.label}
        </span>
      </motion.div>
    );
  }

  // Skill node
  const tier = node.tier ?? "familiar";
  const styles = tierStyles[tier];
  const nodeColor = node.color ?? "#06B6D4";

  return (
    <motion.div
      className={`absolute flex flex-col items-center justify-center rounded-full bg-bg-secondary ${styles.border} ${styles.borderStyle} ${styles.opacity} ${styles.glow} w-[10.667vw] h-[10.667vw] tablet:w-[5vw] tablet:h-[5vw] desktop:w-[2.083vw] desktop:h-[2.083vw] cursor-pointer z-10 transition-all duration-300 ${isDimmed ? "!opacity-20" : ""} ${isHighlighted ? "!opacity-100 scale-110" : ""}`}
      style={
        {
          left: `${node.x}px`,
          top: `${node.y}px`,
          transform: "translate(-50%, -50%)",
          borderColor: nodeColor,
          "--node-color": nodeColor,
        } as React.CSSProperties
      }
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.3, delay: animationDelay }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={onLeave}
    >
      {Icon && (
        <Icon
          className="w-[4.267vw] h-[4.267vw] tablet:w-[2vw] tablet:h-[2vw] desktop:w-[0.833vw] desktop:h-[0.833vw]"
          style={{ color: nodeColor }}
        />
      )}
    </motion.div>
  );
}
```

**Step 2: Run build to verify no type errors**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/components/skill-tree/SkillTreeNode.tsx
git commit -m "feat(skill-tree): add SkillTreeNode component with tier styling"
```

---

### Task 4: SkillTreeConnections SVG component

**Files:**
- Create: `src/app/components/skill-tree/SkillTreeConnections.tsx`

**Context:** Renders an SVG overlay with all connection paths. Paths use quadratic bezier curves with glow effects via SVG filters. Supports highlighting specific connections.

**Step 1: Create the SkillTreeConnections component**

Create `src/app/components/skill-tree/SkillTreeConnections.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import type { LayoutConnection } from "./layout";

interface SkillTreeConnectionsProps {
  connections: LayoutConnection[];
  highlightedIds: Set<string>;
  width: number;
  height: number;
  animationDelay: number;
}

export default function SkillTreeConnections({
  connections,
  highlightedIds,
  width,
  height,
  animationDelay,
}: SkillTreeConnectionsProps) {
  return (
    <svg
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {connections.map((conn, i) => {
        const isHighlighted = highlightedIds.has(conn.id);
        return (
          <motion.path
            key={conn.id}
            d={conn.path}
            fill="none"
            stroke={conn.color}
            strokeWidth={isHighlighted ? 2 : 1}
            strokeOpacity={isHighlighted ? 0.8 : 0.2}
            filter={isHighlighted ? "url(#glow)" : undefined}
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              pathLength: { duration: 0.6, delay: animationDelay + i * 0.03 },
              opacity: { duration: 0.3, delay: animationDelay },
            }}
            className="transition-all duration-300"
          />
        );
      })}
    </svg>
  );
}
```

**Step 2: Run build to verify no type errors**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/components/skill-tree/SkillTreeConnections.tsx
git commit -m "feat(skill-tree): add SVG connections component with glow effects"
```

---

### Task 5: SkillTreeTooltip component

**Files:**
- Create: `src/app/components/skill-tree/SkillTreeTooltip.tsx`

**Context:** A positioned tooltip that appears on skill node hover. Shows the skill name, tier label, and icon at larger size.

**Step 1: Create the SkillTreeTooltip component**

Create `src/app/components/skill-tree/SkillTreeTooltip.tsx`:

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { LayoutNode } from "./layout";
import type { SkillTier } from "@/app/models/common";
import type { IconType } from "react-icons";
import * as SiIcons from "react-icons/si";

const iconMap = SiIcons as unknown as Record<string, IconType>;

const tierLabels: Record<SkillTier, string> = {
  expert: "Mastered",
  proficient: "Proficient",
  familiar: "Familiar",
};

const tierColors: Record<SkillTier, string> = {
  expert: "text-accent-emerald",
  proficient: "text-accent-cyan",
  familiar: "text-text-muted",
};

interface SkillTreeTooltipProps {
  node: LayoutNode | null;
  containerRect: DOMRect | null;
}

export default function SkillTreeTooltip({
  node,
  containerRect,
}: SkillTreeTooltipProps) {
  const Icon = node?.icon ? iconMap[node.icon] : null;
  const tier = node?.tier ?? "familiar";

  return (
    <AnimatePresence>
      {node && node.type === "skill" && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.15 }}
          className="absolute z-50 pointer-events-none bg-bg-secondary border border-border-subtle rounded-[1.333vw] tablet:rounded-[0.625vw] desktop:rounded-[0.26vw] px-[2.667vw] py-[1.6vw] tablet:px-[1.25vw] tablet:py-[0.75vw] desktop:px-[0.521vw] desktop:py-[0.313vw] shadow-lg"
          style={{
            left: `${node.x}px`,
            top: `${node.y + 30}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="flex items-center gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw]">
            {Icon && (
              <Icon
                className="w-[5.333vw] h-[5.333vw] tablet:w-[2.5vw] tablet:h-[2.5vw] desktop:w-[1.042vw] desktop:h-[1.042vw]"
                style={{ color: node.color }}
              />
            )}
            <div>
              <p className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] font-semibold text-foreground whitespace-nowrap">
                {node.label}
              </p>
              <p
                className={`text-[2.667vw] tablet:text-[1.25vw] desktop:text-[0.521vw] font-mono ${tierColors[tier]}`}
              >
                {tierLabels[tier]}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Step 2: Run build to verify no type errors**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/components/skill-tree/SkillTreeTooltip.tsx
git commit -m "feat(skill-tree): add hover tooltip component"
```

---

### Task 6: useSkillTreeLayout hook

**Files:**
- Create: `src/app/components/skill-tree/hooks/useSkillTreeLayout.ts`

**Context:** A hook that observes the container size via ResizeObserver and calls the appropriate layout function (radial for desktop, vertical for mobile). Returns computed layout and updates on resize.

**Step 1: Create the hook**

Create `src/app/components/skill-tree/hooks/useSkillTreeLayout.ts`:

```typescript
"use client";

import { useState, useEffect, useCallback, type RefObject } from "react";
import type { SkillCategory } from "@/app/models/common";
import {
  computeRadialLayout,
  computeVerticalLayout,
  type TreeLayout,
} from "../layout";

const MOBILE_BREAKPOINT = 481;

const EMPTY_LAYOUT: TreeLayout = { nodes: [], connections: [] };

export function useSkillTreeLayout(
  containerRef: RefObject<HTMLDivElement | null>,
  categories: SkillCategory[]
): TreeLayout {
  const [layout, setLayout] = useState<TreeLayout>(EMPTY_LAYOUT);

  const computeLayout = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    if (width === 0) return;

    const isMobile = width < MOBILE_BREAKPOINT;
    const result = isMobile
      ? computeVerticalLayout(categories, width)
      : computeRadialLayout(categories, width, height);

    setLayout(result);
  }, [containerRef, categories]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    computeLayout();

    const observer = new ResizeObserver(() => {
      computeLayout();
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [containerRef, computeLayout]);

  return layout;
}
```

**Step 2: Run build to verify no type errors**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/components/skill-tree/hooks/useSkillTreeLayout.ts
git commit -m "feat(skill-tree): add useSkillTreeLayout hook with ResizeObserver"
```

---

### Task 7: SkillTree main component

**Files:**
- Create: `src/app/components/skill-tree/SkillTree.tsx`
- Create: `src/app/components/skill-tree/index.ts`

**Context:** The main component that composes everything: uses the layout hook, manages hover state, renders connections SVG + nodes + tooltip. This is the component that SkillsSection will render.

**Step 1: Create the SkillTree component**

Create `src/app/components/skill-tree/SkillTree.tsx`:

```tsx
"use client";

import { useRef, useState, useMemo, useCallback } from "react";
import type { SkillCategory } from "@/app/models/common";
import { useSkillTreeLayout } from "./hooks/useSkillTreeLayout";
import SkillTreeConnections from "./SkillTreeConnections";
import SkillTreeNode from "./SkillTreeNode";
import SkillTreeTooltip from "./SkillTreeTooltip";
import type { LayoutNode } from "./layout";

interface SkillTreeProps {
  categories: SkillCategory[];
}

export default function SkillTree({ categories }: SkillTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const layout = useSkillTreeLayout(containerRef, categories);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const handleHover = useCallback((nodeId: string) => {
    setHoveredNodeId(nodeId);
  }, []);

  const handleLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  const hoveredNode = useMemo(
    () => layout.nodes.find((n) => n.id === hoveredNodeId) ?? null,
    [layout.nodes, hoveredNodeId]
  );

  // Determine which connections to highlight based on hovered node
  const highlightedConnectionIds = useMemo(() => {
    const ids = new Set<string>();
    if (!hoveredNodeId) return ids;

    const node = layout.nodes.find((n) => n.id === hoveredNodeId);
    if (!node) return ids;

    if (node.type === "core") {
      // Highlight all connections
      layout.connections.forEach((c) => ids.add(c.id));
    } else if (node.type === "category") {
      // Highlight core->this category + this category->its skills
      layout.connections.forEach((c) => {
        if (c.fromId === node.id || c.toId === node.id) {
          ids.add(c.id);
        }
      });
    } else if (node.type === "skill") {
      // Highlight this skill's connection to its category
      layout.connections.forEach((c) => {
        if (c.toId === node.id) ids.add(c.id);
      });
    }

    return ids;
  }, [hoveredNodeId, layout]);

  // Determine which nodes are dimmed (when hovering a category, dim others)
  const isDimmed = useCallback(
    (node: LayoutNode) => {
      if (!hoveredNodeId) return false;
      const hovered = layout.nodes.find((n) => n.id === hoveredNodeId);
      if (!hovered || hovered.type !== "category") return false;
      // Dim nodes not in this category branch
      if (node.type === "core") return false;
      if (node.id === hoveredNodeId) return false;
      if (node.categoryIndex === hovered.categoryIndex) return false;
      return true;
    },
    [hoveredNodeId, layout.nodes]
  );

  const isHighlighted = useCallback(
    (node: LayoutNode) => {
      if (!hoveredNodeId) return false;
      if (node.id === hoveredNodeId) return true;
      const hovered = layout.nodes.find((n) => n.id === hoveredNodeId);
      if (!hovered) return false;
      // If hovering a category, highlight its skills
      if (
        hovered.type === "category" &&
        node.categoryIndex === hovered.categoryIndex
      )
        return true;
      return false;
    },
    [hoveredNodeId, layout.nodes]
  );

  // Compute animation delays: core first, then categories, then skills
  const getAnimationDelay = useCallback((node: LayoutNode) => {
    if (node.type === "core") return 0;
    if (node.type === "category") return 0.3 + (node.categoryIndex ?? 0) * 0.05;
    // Skills come after their category
    return 0.6 + (node.categoryIndex ?? 0) * 0.05;
  }, []);

  const containerHeight = layout.totalHeight
    ? `${layout.totalHeight}px`
    : "min(70vh, 60vw)";

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: containerHeight }}
    >
      {layout.nodes.length > 0 && (
        <>
          <SkillTreeConnections
            connections={layout.connections}
            highlightedIds={highlightedConnectionIds}
            width={containerRef.current?.clientWidth ?? 0}
            height={containerRef.current?.clientHeight ?? 0}
            animationDelay={0.3}
          />
          {layout.nodes.map((node) => (
            <SkillTreeNode
              key={node.id}
              node={node}
              isHighlighted={isHighlighted(node)}
              isDimmed={isDimmed(node)}
              onHover={handleHover}
              onLeave={handleLeave}
              animationDelay={getAnimationDelay(node)}
            />
          ))}
          <SkillTreeTooltip node={hoveredNode} containerRect={null} />
        </>
      )}
    </div>
  );
}
```

Create `src/app/components/skill-tree/index.ts`:

```typescript
export { default as SkillTree } from "./SkillTree";
```

**Step 2: Run build to verify no type errors**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/components/skill-tree/SkillTree.tsx src/app/components/skill-tree/index.ts
git commit -m "feat(skill-tree): add main SkillTree component with hover interactions"
```

---

### Task 8: Replace SkillsSection content with SkillTree

**Files:**
- Modify: `src/app/_sections/portfolio/SkillsSection/index.tsx`

**Context:** Replace the current badge grid with the new SkillTree component. Keep the Section wrapper and SectionHeading. The SkillTree is a client component, which is fine since SkillsSection is already a client component.

**Step 1: Update SkillsSection to use SkillTree**

Replace the content of `src/app/_sections/portfolio/SkillsSection/index.tsx`:

```tsx
"use client";

import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";
import type { ISkillsSection } from "@/app/models/Skills";
import { SkillTree } from "@/app/components/skill-tree";

export default function SkillsSection({
  sectionLabel,
  title,
  categories,
}: ISkillsSection) {
  return (
    <Section id="skills">
      <SectionHeading label={sectionLabel} title={title} />
      <SkillTree categories={categories} />
    </Section>
  );
}
```

**Step 2: Run build to verify everything works**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Run all tests**

Run: `npx vitest run`
Expected: All tests pass (including the new layout tests)

**Step 4: Commit**

```bash
git add src/app/_sections/portfolio/SkillsSection/index.tsx
git commit -m "feat(skill-tree): replace badge grid with interactive skill tree"
```

---

### Task 9: Visual polish and mobile tap support

**Files:**
- Modify: `src/app/components/skill-tree/SkillTree.tsx`
- Modify: `src/app/components/skill-tree/SkillTreeNode.tsx`

**Context:** Add mobile tap behavior (click toggles hover state instead of mouseover). Add skill name labels below skill nodes on desktop. Fine-tune the visual appearance.

**Step 1: Add click-to-toggle for mobile in SkillTree**

In `src/app/components/skill-tree/SkillTree.tsx`, update `handleHover` to toggle on same-node click:

```typescript
const handleHover = useCallback(
  (nodeId: string) => {
    setHoveredNodeId((prev) => (prev === nodeId ? null : nodeId));
  },
  []
);
```

**Step 2: Add skill name labels below nodes in SkillTreeNode**

In the skill node section of `SkillTreeNode.tsx`, add a label below the icon. After the `</motion.div>` for skill nodes, add a floating label:

Replace the skill node return in `SkillTreeNode.tsx` to include a label underneath:

```tsx
// Skill node
const tier = node.tier ?? "familiar";
const styles = tierStyles[tier];
const nodeColor = node.color ?? "#06B6D4";

return (
  <motion.div
    className="absolute flex flex-col items-center z-10"
    style={{
      left: `${node.x}px`,
      top: `${node.y}px`,
      transform: "translate(-50%, -50%)",
    }}
    initial={{ opacity: 0, scale: 0.5 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.3, delay: animationDelay }}
    onMouseEnter={() => onHover(node.id)}
    onMouseLeave={onLeave}
    onClick={() => onHover(node.id)}
  >
    <div
      className={`flex items-center justify-center rounded-full bg-bg-secondary ${styles.border} ${styles.borderStyle} ${styles.opacity} ${styles.glow} w-[10.667vw] h-[10.667vw] tablet:w-[5vw] tablet:h-[5vw] desktop:w-[2.083vw] desktop:h-[2.083vw] cursor-pointer transition-all duration-300 ${isDimmed ? "!opacity-20" : ""} ${isHighlighted ? "!opacity-100 scale-110" : ""}`}
      style={
        {
          borderColor: nodeColor,
          "--node-color": nodeColor,
        } as React.CSSProperties
      }
    >
      {Icon && (
        <Icon
          className="w-[4.267vw] h-[4.267vw] tablet:w-[2vw] tablet:h-[2vw] desktop:w-[0.833vw] desktop:h-[0.833vw]"
          style={{ color: nodeColor }}
        />
      )}
    </div>
    <span
      className={`mt-[0.8vw] tablet:mt-[0.375vw] desktop:mt-[0.156vw] text-[2.133vw] tablet:text-[1vw] desktop:text-[0.417vw] font-mono text-text-muted whitespace-nowrap transition-opacity duration-300 ${isDimmed ? "opacity-20" : ""}`}
    >
      {node.label}
    </span>
  </motion.div>
);
```

Also add `onClick={() => onHover(node.id)}` to core and category nodes for mobile tap support.

**Step 3: Run build and tests**

Run: `npx next build 2>&1 | tail -5 && npx vitest run`
Expected: Build succeeds, all tests pass

**Step 4: Commit**

```bash
git add src/app/components/skill-tree/SkillTree.tsx src/app/components/skill-tree/SkillTreeNode.tsx
git commit -m "feat(skill-tree): add mobile tap support and skill name labels"
```

---

### Task 10: Final visual testing and cleanup

**Files:**
- Possibly modify: any skill-tree component for tweaks

**Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass

**Step 2: Run production build**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Start dev server and visually verify**

Run: `npm run dev`

Verify in browser at `http://localhost:3000`:
- Skills section shows radial tree on desktop
- Hovering skill nodes shows tooltip with name + tier
- Hovering category nodes highlights that branch, dims others
- SVG paths animate on scroll into view
- Nodes animate in with stagger
- Mobile viewport shows vertical layout
- Tapping nodes on mobile shows tooltip

**Step 4: Commit any final tweaks**

```bash
git add -A
git commit -m "feat(skill-tree): visual polish and final adjustments"
```

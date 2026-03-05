import type { SkillCategory, SkillTier } from "@/app/models/common";

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

interface CircuitSlot {
  ox: number;
  oy: number;
  fan: "h" | "v";
  sign: number;
}

const CIRCUIT_SLOTS: CircuitSlot[] = [
  { ox: 0, oy: -0.58, fan: "h", sign: -1 },
  { ox: 0.4, oy: 0, fan: "v", sign: 1 },
  { ox: 0.3, oy: 0.52, fan: "h", sign: 1 },
  { ox: -0.3, oy: 0.52, fan: "h", sign: 1 },
  { ox: -0.4, oy: 0, fan: "v", sign: -1 },
];

/**
 * Returns an SVG right-angle path (PCB trace style).
 * Routes horizontal-first or vertical-first based on which axis is longer,
 * with a small rounded corner at the turn.
 */
export function computeConnectionPath(
  from: { x: number; y: number },
  to: { x: number; y: number }
): string {
  const r = 6;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);

  if (adx < 1) return `M ${from.x},${from.y} L ${to.x},${to.y}`;
  if (ady < 1) return `M ${from.x},${from.y} L ${to.x},${to.y}`;

  const sx = Math.sign(dx);
  const sy = Math.sign(dy);
  const cr = Math.min(r, adx, ady);

  if (adx >= ady) {
    return `M ${from.x},${from.y} H ${to.x - sx * cr} Q ${to.x},${from.y} ${to.x},${from.y + sy * cr} V ${to.y}`;
  }
  return `M ${from.x},${from.y} V ${to.y - sy * cr} Q ${from.x},${to.y} ${from.x + sx * cr},${to.y} H ${to.x}`;
}

/**
 * Computes an orthogonal PCB trace path for category→skill connections.
 * For horizontal fan: routes H-first then V (creates comb pattern).
 * For vertical fan: routes V-first then H.
 */
function computeCombPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  fan: "h" | "v"
): string {
  const r = 6;
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return `M ${from.x},${from.y}`;
  if (Math.abs(dx) < 1) return `M ${from.x},${from.y} L ${to.x},${to.y}`;
  if (Math.abs(dy) < 1) return `M ${from.x},${from.y} L ${to.x},${to.y}`;

  const sx = Math.sign(dx);
  const sy = Math.sign(dy);
  const cr = Math.min(r, Math.abs(dx), Math.abs(dy));

  if (fan === "h") {
    return `M ${from.x},${from.y} H ${to.x - sx * cr} Q ${to.x},${from.y} ${to.x},${from.y + sy * cr} V ${to.y}`;
  }
  return `M ${from.x},${from.y} V ${to.y - sy * cr} Q ${from.x},${to.y} ${from.x + sx * cr},${to.y} H ${to.x}`;
}

/**
 * Computes a circuit board (PCB) layout for the skill tree.
 * - Core "CPU" chip at center
 * - Category chips at fixed positions around it connected by bus traces
 * - Skills branch off each category in comb patterns (right-angle traces)
 */
export function computeCircuitLayout(
  categories: SkillCategory[],
  width: number,
  height: number
): TreeLayout {
  const nodes: LayoutNode[] = [];
  const connections: LayoutConnection[] = [];

  const padX = 120;
  const padY = 60;
  const cx = width / 2;
  const cy = height * 0.42;
  const halfW = (width - padX * 2) / 2;
  const halfH = (height - padY * 2) / 2;

  const skillGapH = Math.min(70, (width - padX * 2) / 12);
  const skillGapV = Math.min(48, (height - padY * 2) / 16);
  const branchDist = 50;

  const coreId = "core";
  nodes.push({ id: coreId, type: "core", x: cx, y: cy, label: "Skills" });

  categories.forEach((cat, catIdx) => {
    const slot = CIRCUIT_SLOTS[catIdx % CIRCUIT_SLOTS.length];
    const catX = cx + slot.ox * halfW;
    const catY = cy + slot.oy * halfH;
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
      id: `conn-core-${catId}`,
      fromId: coreId,
      toId: catId,
      path: computeConnectionPath({ x: cx, y: cy }, { x: catX, y: catY }),
      color: "#06B6D4",
    });

    const skillCount = cat.skills.length;
    const gap = slot.fan === "h" ? skillGapH : skillGapV;
    const totalSpan = (skillCount - 1) * gap;

    cat.skills.forEach((skill, skillIdx) => {
      const offset = -totalSpan / 2 + skillIdx * gap;
      let skillX: number;
      let skillY: number;

      if (slot.fan === "h") {
        skillX = catX + offset;
        skillY = catY + slot.sign * branchDist;
      } else {
        skillX = catX + slot.sign * branchDist;
        skillY = catY + offset;
      }

      const skillId = `skill-${catIdx}-${skillIdx}`;
      nodes.push({
        id: skillId,
        type: "skill",
        x: skillX,
        y: skillY,
        label: skill.name,
        icon: skill.icon,
        color: skill.color,
        tier: skill.tier,
        parentId: catId,
        categoryIndex: catIdx,
      });

      connections.push({
        id: `conn-${catId}-${skillId}`,
        fromId: catId,
        toId: skillId,
        path: computeCombPath(
          { x: catX, y: catY },
          { x: skillX, y: skillY },
          slot.fan
        ),
        color: skill.color,
      });
    });
  });

  return { nodes, connections };
}

/**
 * Computes a vertical (mobile) tree layout with PCB-style traces.
 * - Core node at top center
 * - Categories stacked vertically on the left
 * - Skills arranged in rows to the right of their category
 */
export function computeVerticalLayout(
  categories: SkillCategory[],
  width: number
): TreeLayout {
  const nodes: LayoutNode[] = [];
  const connections: LayoutConnection[] = [];

  const coreX = width / 2;
  const coreY = 40;
  const coreId = "core";
  const catX = width * 0.25;
  const skillStartX = width * 0.5;
  const skillGapX = 80;
  const categoryGap = 120;
  let currentY = coreY + 100;

  nodes.push({
    id: coreId,
    type: "core",
    x: coreX,
    y: coreY,
    label: "Skills",
  });

  categories.forEach((cat, catIdx) => {
    const catY = currentY;
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
      id: `conn-core-${catId}`,
      fromId: coreId,
      toId: catId,
      path: computeConnectionPath(
        { x: coreX, y: coreY },
        { x: catX, y: catY }
      ),
      color: "#06B6D4",
    });

    const skillsPerRow = Math.max(
      1,
      Math.floor((width - skillStartX) / skillGapX)
    );

    cat.skills.forEach((skill, skillIdx) => {
      const col = skillIdx % skillsPerRow;
      const row = Math.floor(skillIdx / skillsPerRow);
      const skillX = skillStartX + col * skillGapX;
      const skillY = catY + row * 60;
      const skillId = `skill-${catIdx}-${skillIdx}`;

      nodes.push({
        id: skillId,
        type: "skill",
        x: skillX,
        y: skillY,
        label: skill.name,
        icon: skill.icon,
        color: skill.color,
        tier: skill.tier,
        parentId: catId,
        categoryIndex: catIdx,
      });

      connections.push({
        id: `conn-${catId}-${skillId}`,
        fromId: catId,
        toId: skillId,
        path: computeConnectionPath(
          { x: catX, y: catY },
          { x: skillX, y: skillY }
        ),
        color: skill.color,
      });
    });

    const rows = Math.ceil(cat.skills.length / skillsPerRow);
    currentY += Math.max(rows * 60, 60) + categoryGap;
  });

  return { nodes, connections, totalHeight: currentY };
}

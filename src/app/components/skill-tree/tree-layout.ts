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

/**
 * Returns an SVG quadratic bezier path string from `from` to `to`.
 * The control point is placed at the midpoint x and the `from` y
 * to create a smooth curve.
 */
export function computeConnectionPath(
  from: { x: number; y: number },
  to: { x: number; y: number }
): string {
  const cx = (from.x + to.x) / 2;
  const cy = from.y;
  return `M ${from.x},${from.y} Q ${cx},${cy} ${to.x},${to.y}`;
}

/**
 * Computes a radial (desktop) layout for the skill tree.
 * - Core node at center
 * - Category nodes at equal angles, radius = min(w,h) * 0.3
 * - Skill nodes fanned around their category, radius = min(w,h) * 0.45
 */
export function computeRadialLayout(
  categories: SkillCategory[],
  width: number,
  height: number
): TreeLayout {
  const nodes: LayoutNode[] = [];
  const connections: LayoutConnection[] = [];

  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height);
  const catRadius = r * 0.3;
  const skillRadius = r * 0.45;
  const startAngle = -Math.PI / 2;
  const angleStep = (2 * Math.PI) / categories.length;

  // Core node
  const coreId = "core";
  nodes.push({
    id: coreId,
    type: "core",
    x: cx,
    y: cy,
    label: "Skills",
  });

  categories.forEach((cat, catIdx) => {
    const catAngle = startAngle + catIdx * angleStep;
    const catX = cx + catRadius * Math.cos(catAngle);
    const catY = cy + catRadius * Math.sin(catAngle);
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

    // Fan skills around their category
    const skillCount = cat.skills.length;
    const fanSpread = Math.PI / 4; // total fan angle
    const skillAngleStep = skillCount > 1 ? fanSpread / (skillCount - 1) : 0;
    const skillStartAngle = catAngle - fanSpread / 2;

    cat.skills.forEach((skill, skillIdx) => {
      const skillAngle =
        skillCount > 1
          ? skillStartAngle + skillIdx * skillAngleStep
          : catAngle;
      const skillX = cx + skillRadius * Math.cos(skillAngle);
      const skillY = cy + skillRadius * Math.sin(skillAngle);
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
  });

  return { nodes, connections };
}

/**
 * Computes a vertical (mobile) tree layout.
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

    // Arrange skills in rows to the right
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

    // Advance Y for next category
    const rows = Math.ceil(cat.skills.length / skillsPerRow);
    currentY += Math.max(rows * 60, 60) + categoryGap;
  });

  return { nodes, connections, totalHeight: currentY };
}

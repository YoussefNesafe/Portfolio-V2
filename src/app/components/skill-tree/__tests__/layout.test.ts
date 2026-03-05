import { describe, it, expect } from "vitest";
import type { SkillCategory } from "@/app/models/common";
import {
  computeCircuitLayout,
  computeVerticalLayout,
  computeConnectionPath,
} from "../tree-layout";

const MOCK_CATEGORIES: SkillCategory[] = [
  {
    name: "Frontend",
    skills: [
      {
        name: "React",
        icon: "SiReact",
        color: "#61DAFB",
        tier: "expert" as const,
      },
      {
        name: "Vue.js",
        icon: "SiVuedotjs",
        color: "#4FC08D",
        tier: "proficient" as const,
      },
    ],
  },
  {
    name: "Testing",
    skills: [
      {
        name: "Jest",
        icon: "SiJest",
        color: "#C21325",
        tier: "proficient" as const,
      },
    ],
  },
];

describe("computeCircuitLayout", () => {
  const layout = computeCircuitLayout(MOCK_CATEGORIES, 800, 600);

  it("places core node at horizontal center, shifted up vertically", () => {
    const core = layout.nodes.find((n) => n.type === "core");
    expect(core).toBeDefined();
    expect(core!.x).toBe(400);
    expect(core!.y).toBeLessThan(300);
    expect(core!.y).toBeGreaterThan(200);
  });

  it("creates correct number of category nodes", () => {
    const categoryNodes = layout.nodes.filter((n) => n.type === "category");
    expect(categoryNodes).toHaveLength(2);
  });

  it("creates correct number of skill nodes", () => {
    const skillNodes = layout.nodes.filter((n) => n.type === "skill");
    expect(skillNodes).toHaveLength(3);
  });

  it("creates correct number of connections (core->cat + cat->skill)", () => {
    // 2 core->category + 2 Frontend skills + 1 Testing skill = 5
    expect(layout.connections).toHaveLength(5);
  });

  it("places categories at distinct positions around center", () => {
    const categoryNodes = layout.nodes.filter((n) => n.type === "category");
    const [cat0, cat1] = categoryNodes;

    // Categories should be at different positions
    const dist = Math.sqrt((cat0.x - cat1.x) ** 2 + (cat0.y - cat1.y) ** 2);
    expect(dist).toBeGreaterThan(50);
  });

  it("includes tier information on skill nodes", () => {
    const skillNodes = layout.nodes.filter((n) => n.type === "skill");
    const react = skillNodes.find((n) => n.label === "React");
    expect(react).toBeDefined();
    expect(react!.tier).toBe("expert");

    const jest = skillNodes.find((n) => n.label === "Jest");
    expect(jest).toBeDefined();
    expect(jest!.tier).toBe("proficient");
  });

  it("keeps all nodes within bounds", () => {
    for (const node of layout.nodes) {
      expect(node.x).toBeGreaterThanOrEqual(0);
      expect(node.x).toBeLessThanOrEqual(800);
      expect(node.y).toBeGreaterThanOrEqual(0);
      expect(node.y).toBeLessThanOrEqual(600);
    }
  });
});

describe("computeVerticalLayout", () => {
  const layout = computeVerticalLayout(MOCK_CATEGORIES, 800);

  it("places core node at top center", () => {
    const core = layout.nodes.find((n) => n.type === "core");
    expect(core).toBeDefined();
    expect(core!.x).toBe(400);
    expect(core!.y).toBeCloseTo(40, 0);
  });

  it("places categories below core", () => {
    const core = layout.nodes.find((n) => n.type === "core");
    const categoryNodes = layout.nodes.filter((n) => n.type === "category");

    for (const cat of categoryNodes) {
      expect(cat.y).toBeGreaterThan(core!.y);
    }
  });

  it("places skills to the right of their category", () => {
    const categoryNodes = layout.nodes.filter((n) => n.type === "category");
    const skillNodes = layout.nodes.filter((n) => n.type === "skill");

    for (const skill of skillNodes) {
      const parentCat = categoryNodes.find((c) => c.id === skill.parentId);
      expect(parentCat).toBeDefined();
      expect(skill.x).toBeGreaterThan(parentCat!.x);
    }
  });

  it("returns totalHeight", () => {
    expect(layout.totalHeight).toBeDefined();
    expect(layout.totalHeight).toBeGreaterThan(0);
  });
});

describe("computeConnectionPath", () => {
  it("returns a straight vertical line when x is aligned", () => {
    const path = computeConnectionPath({ x: 100, y: 0 }, { x: 100, y: 100 });
    expect(path).toMatch(/^M .+ L .+$/);
  });

  it("returns a straight horizontal line when y is aligned", () => {
    const path = computeConnectionPath({ x: 0, y: 50 }, { x: 100, y: 50 });
    expect(path).toMatch(/^M .+ L .+$/);
  });

  it("returns a right-angle path with rounded corner for diagonal", () => {
    const path = computeConnectionPath({ x: 0, y: 0 }, { x: 100, y: 100 });
    // Should contain H (horizontal), Q (quadratic curve), V (vertical) or vice versa
    expect(path).toMatch(/[HV].*Q.*[HV]/);
  });
});

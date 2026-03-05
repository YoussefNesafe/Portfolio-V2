import { describe, it, expect } from "vitest";
import type { SkillCategory } from "@/app/models/common";
import {
  computeRadialLayout,
  computeVerticalLayout,
  computeConnectionPath,
} from "../layout";

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

describe("computeRadialLayout", () => {
  const layout = computeRadialLayout(MOCK_CATEGORIES, 800, 600);

  it("places core node at center", () => {
    const core = layout.nodes.find((n) => n.type === "core");
    expect(core).toBeDefined();
    expect(core!.x).toBe(400);
    expect(core!.y).toBe(300);
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

  it("places categories at equal angles", () => {
    const categoryNodes = layout.nodes.filter((n) => n.type === "category");
    const cx = 400;
    const cy = 300;

    // Calculate angles from center for each category
    const angles = categoryNodes.map((n) =>
      Math.atan2(n.y - cy, n.x - cx)
    );

    // With 2 categories, angle difference should be PI
    const diff = Math.abs(angles[1] - angles[0]);
    expect(diff).toBeCloseTo(Math.PI, 1);
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
  it("returns a valid SVG quadratic bezier path", () => {
    const path = computeConnectionPath(
      { x: 0, y: 0 },
      { x: 100, y: 100 }
    );

    expect(path).toMatch(/^M\s*[\d.-]+,[\d.-]+\s*Q\s*[\d.-]+,[\d.-]+\s+[\d.-]+,[\d.-]+$/);
  });
});

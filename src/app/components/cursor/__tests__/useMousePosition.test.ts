import { describe, it, expect } from "vitest";
import { getSectionColor, SECTION_COLORS, DEFAULT_COLOR } from "../useMousePosition";

describe("getSectionColor", () => {
  it("returns cyan for hero section", () => {
    expect(getSectionColor("hero")).toBe(SECTION_COLORS.hero);
  });

  it("returns purple for about section", () => {
    expect(getSectionColor("about")).toBe(SECTION_COLORS.about);
  });

  it("returns purple for experience section", () => {
    expect(getSectionColor("experience")).toBe(SECTION_COLORS.experience);
  });

  it("returns emerald for projects section", () => {
    expect(getSectionColor("projects")).toBe(SECTION_COLORS.projects);
  });

  it("returns cyan for skills section", () => {
    expect(getSectionColor("skills")).toBe(SECTION_COLORS.skills);
  });

  it("returns emerald for contact section", () => {
    expect(getSectionColor("contact")).toBe(SECTION_COLORS.contact);
  });

  it("returns default color for unknown section", () => {
    expect(getSectionColor("unknown")).toBe(DEFAULT_COLOR);
  });

  it("returns default color for null", () => {
    expect(getSectionColor(null)).toBe(DEFAULT_COLOR);
  });
});

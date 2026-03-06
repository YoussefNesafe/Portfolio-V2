// src/app/components/xray/hooks/__tests__/useElementSpecs.test.ts
import { describe, it, expect } from "vitest";
import { rgbToHex, formatSpacing, extractSpecs } from "../useElementSpecs";

describe("rgbToHex", () => {
  it("converts rgb string to hex", () => {
    expect(rgbToHex("rgb(6, 182, 212)")).toBe("#06B6D4");
  });

  it("converts rgba string to hex", () => {
    expect(rgbToHex("rgba(168, 85, 247, 0.5)")).toBe("#A855F7");
  });

  it("returns transparent for rgba with 0 alpha", () => {
    expect(rgbToHex("rgba(0, 0, 0, 0)")).toBe("transparent");
  });

  it("passes through hex values unchanged", () => {
    expect(rgbToHex("#FF0000")).toBe("#FF0000");
  });

  it("handles empty string", () => {
    expect(rgbToHex("")).toBe("");
  });
});

describe("formatSpacing", () => {
  it("formats identical values as single value", () => {
    expect(formatSpacing("10px", "10px", "10px", "10px")).toBe("10px");
  });

  it("formats top/bottom + left/right shorthand", () => {
    expect(formatSpacing("10px", "20px", "10px", "20px")).toBe("10px 20px");
  });

  it("formats all-different values", () => {
    expect(formatSpacing("10px", "20px", "30px", "40px")).toBe(
      "10px 20px 30px 40px"
    );
  });

  it("returns 0 for all zeros", () => {
    expect(formatSpacing("0px", "0px", "0px", "0px")).toBe("0");
  });
});

describe("extractSpecs", () => {
  it("returns null for null element", () => {
    expect(extractSpecs(null)).toBeNull();
  });
});

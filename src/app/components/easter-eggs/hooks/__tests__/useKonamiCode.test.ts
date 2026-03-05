import { describe, it, expect } from "vitest";
import { matchesKonamiSequence, KONAMI_SEQUENCE } from "../useKonamiCode";

describe("matchesKonamiSequence", () => {
  it("returns true when buffer matches the full Konami sequence", () => {
    expect(matchesKonamiSequence([...KONAMI_SEQUENCE])).toBe(true);
  });

  it("returns false for partial sequence", () => {
    expect(matchesKonamiSequence(["ArrowUp", "ArrowUp", "ArrowDown"])).toBe(false);
  });

  it("returns false for empty buffer", () => {
    expect(matchesKonamiSequence([])).toBe(false);
  });

  it("returns false for wrong sequence", () => {
    const wrong = ["ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    expect(matchesKonamiSequence(wrong)).toBe(false);
  });
});

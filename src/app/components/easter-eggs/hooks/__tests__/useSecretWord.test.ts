import { describe, it, expect } from "vitest";
import { checkWordMatch } from "../useSecretWord";

describe("checkWordMatch", () => {
  it("returns matched word when buffer ends with a registered word", () => {
    const words = ["hire", "hello"];
    expect(checkWordMatch("xhire".split(""), words)).toBe("hire");
  });

  it("returns matched word for hello", () => {
    const words = ["hire", "hello"];
    expect(checkWordMatch("abchello".split(""), words)).toBe("hello");
  });

  it("returns null when no word matches", () => {
    const words = ["hire", "hello"];
    expect(checkWordMatch("xyz".split(""), words)).toBeNull();
  });

  it("returns null for empty buffer", () => {
    const words = ["hire", "hello"];
    expect(checkWordMatch([], words)).toBeNull();
  });

  it("is case-insensitive", () => {
    const words = ["hire"];
    expect(checkWordMatch("HIRE".split(""), words)).toBe("hire");
  });
});

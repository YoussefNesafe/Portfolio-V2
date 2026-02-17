import { getBpClassName } from "../getBpClassName";

describe("getBpClassName", () => {
  it("prefixes tablet classes", () => {
    expect(getBpClassName("text-[1.5vw]")).toBe("tablet:text-[1.5vw]");
  });

  it("prefixes both tablet and desktop classes", () => {
    expect(getBpClassName("text-[1.5vw]", "text-[0.625vw]")).toBe(
      "tablet:text-[1.5vw] desktop:text-[0.625vw]",
    );
  });

  it("handles multiple tablet classes", () => {
    expect(getBpClassName("p-[2vw] m-[1vw]")).toBe(
      "tablet:p-[2vw] tablet:m-[1vw]",
    );
  });

  it("handles multiple desktop classes", () => {
    expect(getBpClassName("p-[2vw]", "p-[0.8vw] m-[0.4vw]")).toBe(
      "tablet:p-[2vw] desktop:p-[0.8vw] desktop:m-[0.4vw]",
    );
  });

  it("trims whitespace from input", () => {
    expect(getBpClassName("  text-[1.5vw]  ", "  text-[0.625vw]  ")).toBe(
      "tablet:text-[1.5vw] desktop:text-[0.625vw]",
    );
  });
});

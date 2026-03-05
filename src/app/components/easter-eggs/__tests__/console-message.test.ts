import { describe, it, expect, vi, beforeEach } from "vitest";

describe("printConsoleMessage", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("logs the ASCII art and welcome message", async () => {
    const { printConsoleMessage } = await import("../console-message");
    printConsoleMessage();
    expect(console.log).toHaveBeenCalled();
    const allCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls
      .map((c) => c.join(" "))
      .join("\n");
    expect(allCalls).toContain("HACK DETECTED");
    expect(allCalls).toContain("Just kidding");
    expect(allCalls).toContain("linkedin.com/in/youssef-nesafe");
  });
});

import { describe, it, expect } from "vitest";
import { executeCommand, navigateHistory } from "../useTerminal";
import { buildRegistry, type CommandContext } from "../../commands";

const registry = buildRegistry();

function makeContext(history: string[] = []): CommandContext {
  return {
    dict: {
      hero: { greeting: "", name: "Test", titlePrefix: "Sr", titleHighlight: "FE", titleSuffix: "Eng", tagline: "", ctaPrimary: { label: "", href: "" }, ctaSecondary: { label: "", href: "" }, scrollHint: "" },
      about: { sectionLabel: "", title: "", terminal: { command: "", lines: ["about text"] }, stats: [] },
      experience: { sectionLabel: "", title: "", items: [] },
      projects: { sectionLabel: "", title: "", items: [] },
      skills: { sectionLabel: "", title: "", categories: [] },
      contact: { sectionLabel: "", title: "", description: "", items: [], terminal: { command: "", lines: [] }, ctaLabel: "", ctaHref: "" },
    },
    history,
    triggerMatrix: () => {},
    triggerDownload: () => {},
    triggerMailto: () => {},
  };
}

describe("executeCommand", () => {
  it("executes a known command and returns output", () => {
    const result = executeCommand("whoami", registry, makeContext());
    expect(result.output.length).toBeGreaterThan(0);
    expect(result.output.some((l) => l.content.includes("Test"))).toBe(true);
  });

  it("returns error for unknown command", () => {
    const result = executeCommand("foobar", registry, makeContext());
    expect(result.output[0].type).toBe("error");
    expect(result.output[0].content).toContain("foobar");
  });

  it("trims input whitespace", () => {
    const result = executeCommand("  whoami  ", registry, makeContext());
    expect(result.output.some((l) => l.content.includes("Test"))).toBe(true);
  });

  it("handles empty input", () => {
    const result = executeCommand("", registry, makeContext());
    expect(result.output).toEqual([]);
  });

  it("parses multi-word commands like sudo hire-me", () => {
    const ctx = makeContext();
    const result = executeCommand("sudo hire-me", registry, ctx);
    expect(result.output.some((l) => l.type === "success")).toBe(true);
  });

  it("parses echo with args", () => {
    const result = executeCommand("echo hello world", registry, makeContext());
    expect(result.output[0].content).toBe("hello world");
  });

  it("returns isClear true for clear command", () => {
    const result = executeCommand("clear", registry, makeContext());
    expect(result.isClear).toBe(true);
  });
});

describe("navigateHistory", () => {
  const history = ["whoami", "help", "ls"];

  it("up from -1 returns last command", () => {
    expect(navigateHistory(history, -1, "up")).toEqual({ index: 2, value: "ls" });
  });

  it("up from 2 returns previous command", () => {
    expect(navigateHistory(history, 2, "up")).toEqual({ index: 1, value: "help" });
  });

  it("up from 0 stays at 0", () => {
    expect(navigateHistory(history, 0, "up")).toEqual({ index: 0, value: "whoami" });
  });

  it("down from 1 returns next command", () => {
    expect(navigateHistory(history, 1, "down")).toEqual({ index: 2, value: "ls" });
  });

  it("down from last resets to empty", () => {
    expect(navigateHistory(history, 2, "down")).toEqual({ index: -1, value: "" });
  });

  it("returns empty for empty history", () => {
    expect(navigateHistory([], -1, "up")).toEqual({ index: -1, value: "" });
  });
});

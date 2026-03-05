import { describe, it, expect } from "vitest";
import { createRegistry, type CommandDefinition, type CommandContext } from "../registry";

const mockContext: CommandContext = {
  dict: {} as CommandContext["dict"],
  history: [],
  triggerMatrix: () => {},
  triggerDownload: () => {},
  triggerMailto: () => {},
};

describe("createRegistry", () => {
  it("registers and looks up a command", () => {
    const cmd: CommandDefinition = {
      name: "test",
      description: "A test command",
      execute: () => [{ type: "text", content: "hello" }],
    };
    const registry = createRegistry([cmd]);
    expect(registry.get("test")).toBe(cmd);
  });

  it("returns undefined for unknown command", () => {
    const registry = createRegistry([]);
    expect(registry.get("nope")).toBeUndefined();
  });

  it("generates help output listing all commands", () => {
    const cmds: CommandDefinition[] = [
      { name: "foo", description: "Does foo", execute: () => [] },
      { name: "bar", description: "Does bar", execute: () => [] },
    ];
    const registry = createRegistry(cmds);
    const lines = registry.helpLines();
    expect(lines.length).toBe(2);
    expect(lines[0]).toContain("foo");
    expect(lines[0]).toContain("Does foo");
    expect(lines[1]).toContain("bar");
  });

  it("returns all command names for autocomplete", () => {
    const cmds: CommandDefinition[] = [
      { name: "alpha", description: "", execute: () => [] },
      { name: "beta", description: "", execute: () => [] },
    ];
    const registry = createRegistry(cmds);
    expect(registry.commandNames()).toEqual(["alpha", "beta"]);
  });
});

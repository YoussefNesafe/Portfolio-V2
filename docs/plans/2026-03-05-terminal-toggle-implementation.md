# Designer/Dev Mode Toggle + Interactive Terminal — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Figma-style toggle that switches the homepage between the visual portfolio ("Designer Mode") and a full-screen interactive terminal ("Dev Mode").

**Architecture:** `ViewModeProvider` context wraps the public layout, holding mode state and terminal session. Homepage conditionally renders sections or `InteractiveTerminal`. A fixed pill toggle at bottom-center switches modes. Commands are pure functions tested in isolation.

**Tech Stack:** React 19 context/hooks, Framer Motion (toggle animation), localStorage (persistence), Vitest

**Design doc:** `docs/plans/2026-03-05-terminal-toggle-design.md`

**Key reference files:**
- Dictionary: `src/dictionaries/en.json` (all portfolio data)
- Dictionary type: `src/app/models/IDictionary.ts`
- Common types: `src/app/models/common/index.ts` (ExperienceItem, ProjectItem, SkillCategory, ContactItem)
- Public layout: `src/app/(public)/layout.tsx` (wraps with EasterEggsProvider)
- Homepage: `src/app/(public)/page.tsx` (renders 6 sections)
- Footer: `src/app/components/layout/Footer/index.tsx`
- Easter eggs provider: `src/app/components/easter-eggs/EasterEggsProvider.tsx`
- Easter eggs context: `src/app/components/easter-eggs/EasterEggsContext.ts`

**Styling rules:** Always use vw-based sizing with 3 breakpoints: `text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]`. No predefined Tailwind size classes.

---

### Task 1: Command Types and Registry (TDD)

**Files:**
- Create: `src/app/components/view-mode/commands/registry.ts`
- Create: `src/app/components/view-mode/commands/__tests__/registry.test.ts`

**Step 1: Write the failing test**

```ts
// src/app/components/view-mode/commands/__tests__/registry.test.ts
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
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/components/view-mode/commands/__tests__/registry.test.ts`
Expected: FAIL — cannot find module

**Step 3: Write minimal implementation**

```ts
// src/app/components/view-mode/commands/registry.ts
import type { IDictionary } from "@/app/models/IDictionary";

export interface OutputLine {
  type: "text" | "error" | "success" | "accent" | "muted" | "break";
  content: string;
}

export interface CommandContext {
  dict: Pick<IDictionary, "hero" | "about" | "experience" | "projects" | "skills" | "contact">;
  history: string[];
  triggerMatrix: () => void;
  triggerDownload: (path: string) => void;
  triggerMailto: (email: string) => void;
}

export interface CommandDefinition {
  name: string;
  description: string;
  execute: (args: string[], ctx: CommandContext) => OutputLine[];
}

export interface CommandRegistry {
  get: (name: string) => CommandDefinition | undefined;
  helpLines: () => string[];
  commandNames: () => string[];
}

export function createRegistry(commands: CommandDefinition[]): CommandRegistry {
  const map = new Map(commands.map((cmd) => [cmd.name, cmd]));

  return {
    get: (name) => map.get(name),
    helpLines: () =>
      commands.map((cmd) => {
        const padded = cmd.name.padEnd(20);
        return `  ${padded}${cmd.description}`;
      }),
    commandNames: () => commands.map((cmd) => cmd.name),
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/components/view-mode/commands/__tests__/registry.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/components/view-mode/commands/registry.ts src/app/components/view-mode/commands/__tests__/registry.test.ts
git commit -m "feat(terminal): add command registry with types and tests"
```

---

### Task 2: Portfolio Commands (TDD)

**Files:**
- Create: `src/app/components/view-mode/commands/commands.ts`
- Create: `src/app/components/view-mode/commands/__tests__/commands.test.ts`
- Create: `src/app/components/view-mode/commands/index.ts`

**Step 1: Write the failing test**

```ts
// src/app/components/view-mode/commands/__tests__/commands.test.ts
import { describe, it, expect, vi } from "vitest";
import { allCommands } from "../index";
import { createRegistry, type CommandContext } from "../registry";

function makeContext(overrides?: Partial<CommandContext>): CommandContext {
  return {
    dict: {
      hero: {
        greeting: "> const developer = \"Youssef Nesafe\";",
        name: "Youssef Nesafe",
        titlePrefix: "Senior",
        titleHighlight: "Frontend",
        titleSuffix: "Engineer",
        tagline: "Crafting scalable apps.",
        ctaPrimary: { label: "View", href: "#" },
        ctaSecondary: { label: "Contact", href: "#" },
        scrollHint: "Scroll",
      },
      about: {
        sectionLabel: "// about",
        title: "About",
        terminal: {
          command: "cat about.txt",
          lines: ["Line one.", "Line two."],
        },
        stats: [{ value: 6, suffix: "+", label: "Years" }],
      },
      experience: {
        sectionLabel: "// experience",
        title: "Experience",
        items: [
          {
            company: "Acme",
            role: "Senior Dev",
            period: "2022 - Present",
            location: "Dubai",
            description: "Desc",
            achievements: ["Built stuff"],
            tech: ["React", "TypeScript"],
          },
        ],
      },
      projects: {
        sectionLabel: "// projects",
        title: "Projects",
        items: [
          {
            id: "proj1",
            title: "Cool Project",
            type: "Web App",
            description: "A cool project",
            image: "/img.png",
            url: "https://example.com",
            highlights: ["Fast"],
            tech: ["Next.js"],
          },
        ],
      },
      skills: {
        sectionLabel: "// skills",
        title: "Skills",
        categories: [
          {
            name: "Frontend",
            skills: [
              { name: "React", icon: "SiReact", color: "#61DAFB" },
            ],
          },
        ],
      },
      contact: {
        sectionLabel: "// contact",
        title: "Contact",
        description: "Get in touch",
        items: [
          { type: "Email", value: "test@test.com", href: "mailto:test@test.com", icon: "FiMail" },
        ],
        terminal: { command: "const contact = {", lines: ["  email: \"test\"", "}"] },
        ctaLabel: "Send",
        ctaHref: "mailto:test@test.com",
      },
    },
    history: ["whoami", "help"],
    triggerMatrix: vi.fn(),
    triggerDownload: vi.fn(),
    triggerMailto: vi.fn(),
    ...overrides,
  };
}

describe("commands", () => {
  const registry = createRegistry(allCommands);

  it("whoami returns name and title", () => {
    const ctx = makeContext();
    const cmd = registry.get("whoami")!;
    const output = cmd.execute([], ctx);
    const text = output.map((l) => l.content).join(" ");
    expect(text).toContain("Youssef Nesafe");
    expect(text).toContain("Senior");
  });

  it("about returns about text", () => {
    const ctx = makeContext();
    const output = registry.get("about")!.execute([], ctx);
    const text = output.map((l) => l.content).join(" ");
    expect(text).toContain("Line one.");
  });

  it("experience returns company and role", () => {
    const ctx = makeContext();
    const output = registry.get("experience")!.execute([], ctx);
    const text = output.map((l) => l.content).join(" ");
    expect(text).toContain("Acme");
    expect(text).toContain("Senior Dev");
  });

  it("projects returns project title", () => {
    const ctx = makeContext();
    const output = registry.get("projects")!.execute([], ctx);
    const text = output.map((l) => l.content).join(" ");
    expect(text).toContain("Cool Project");
  });

  it("skills returns category and skill names", () => {
    const ctx = makeContext();
    const output = registry.get("skills")!.execute([], ctx);
    const text = output.map((l) => l.content).join(" ");
    expect(text).toContain("Frontend");
    expect(text).toContain("React");
  });

  it("contact returns contact info", () => {
    const ctx = makeContext();
    const output = registry.get("contact")!.execute([], ctx);
    const text = output.map((l) => l.content).join(" ");
    expect(text).toContain("test@test.com");
  });

  it("ls returns file listing", () => {
    const output = registry.get("ls")!.execute([], makeContext());
    const text = output.map((l) => l.content).join(" ");
    expect(text).toContain("about.txt");
    expect(text).toContain("resume.pdf");
  });

  it("history returns numbered history", () => {
    const ctx = makeContext({ history: ["whoami", "help"] });
    const output = registry.get("history")!.execute([], ctx);
    expect(output[0].content).toContain("1");
    expect(output[0].content).toContain("whoami");
  });

  it("clear returns empty array", () => {
    const output = registry.get("clear")!.execute([], makeContext());
    expect(output).toEqual([]);
  });

  it("help returns list of commands", () => {
    const output = registry.get("help")!.execute([], makeContext());
    expect(output.length).toBeGreaterThan(5);
  });

  it("sudo hire-me calls triggerMailto", () => {
    const ctx = makeContext();
    registry.get("sudo hire-me")!.execute([], ctx);
    expect(ctx.triggerMailto).toHaveBeenCalled();
  });

  it("cat resume.pdf calls triggerDownload", () => {
    const ctx = makeContext();
    registry.get("cat resume.pdf")!.execute([], ctx);
    expect(ctx.triggerDownload).toHaveBeenCalledWith("/pdf/cv.pdf");
  });

  it("echo returns the input text", () => {
    const output = registry.get("echo")!.execute(["hello", "world"], makeContext());
    expect(output[0].content).toBe("hello world");
  });

  it("sudo rm -rf / returns joke", () => {
    const output = registry.get("sudo rm -rf /")!.execute([], makeContext());
    const text = output.map((l) => l.content).join(" ");
    expect(text).toContain("Permission denied");
  });

  it("coffee returns ascii art", () => {
    const output = registry.get("coffee")!.execute([], makeContext());
    expect(output.length).toBeGreaterThan(1);
  });

  it("matrix calls triggerMatrix", () => {
    const ctx = makeContext();
    registry.get("matrix")!.execute([], ctx);
    expect(ctx.triggerMatrix).toHaveBeenCalled();
  });

  it("neofetch returns system info", () => {
    const output = registry.get("neofetch")!.execute([], makeContext());
    const text = output.map((l) => l.content).join(" ");
    expect(text).toContain("Next.js");
    expect(text).toContain("React 19");
  });

  it("ping google.com returns joke redirect", () => {
    const output = registry.get("ping")!.execute(["google.com"], makeContext());
    const text = output.map((l) => l.content).join(" ");
    expect(text).toContain("ping youssef");
  });

  it("ping youssef returns available message", () => {
    const output = registry.get("ping")!.execute(["youssef"], makeContext());
    const text = output.map((l) => l.content).join(" ");
    expect(text).toContain("available");
  });

  it("exit returns joke", () => {
    const output = registry.get("exit")!.execute([], makeContext());
    const text = output.map((l) => l.content).join(" ");
    expect(text).toContain("hire me");
  });

  it("date returns current date", () => {
    const output = registry.get("date")!.execute([], makeContext());
    const text = output.map((l) => l.content).join(" ");
    expect(text).toContain(new Date().getFullYear().toString());
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/components/view-mode/commands/__tests__/commands.test.ts`
Expected: FAIL

**Step 3: Write implementation**

```ts
// src/app/components/view-mode/commands/commands.ts
import type { CommandDefinition, OutputLine, CommandContext } from "./registry";
import { createRegistry } from "./registry";

const text = (content: string): OutputLine => ({ type: "text", content });
const accent = (content: string): OutputLine => ({ type: "accent", content });
const muted = (content: string): OutputLine => ({ type: "muted", content });
const success = (content: string): OutputLine => ({ type: "success", content });
const error = (content: string): OutputLine => ({ type: "error", content });
const br = (): OutputLine => ({ type: "break", content: "" });

// We need a reference to the registry for the help command.
// The help command is created via a factory after registry is built.
let registryRef: ReturnType<typeof createRegistry> | null = null;

const helpCommand: CommandDefinition = {
  name: "help",
  description: "List all available commands",
  execute: () => {
    if (!registryRef) return [text("No commands registered.")];
    return [
      accent("Available commands:"),
      br(),
      ...registryRef.helpLines().map((line) => text(line)),
      br(),
      muted("Tip: Use Tab for autocomplete, Up/Down for history"),
    ];
  },
};

const whoami: CommandDefinition = {
  name: "whoami",
  description: "Who am I?",
  execute: (_, ctx) => {
    const { hero } = ctx.dict;
    return [
      accent(`${hero.name}`),
      text(`${hero.titlePrefix} ${hero.titleHighlight} ${hero.titleSuffix}`),
      br(),
      muted(hero.tagline),
    ];
  },
};

const about: CommandDefinition = {
  name: "about",
  description: "About me",
  execute: (_, ctx) => {
    const { about } = ctx.dict;
    return [
      accent(`$ ${about.terminal.command}`),
      br(),
      ...about.terminal.lines.map((line) => text(line)),
    ];
  },
};

const experience: CommandDefinition = {
  name: "experience",
  description: "Work experience timeline",
  execute: (_, ctx) => {
    const lines: OutputLine[] = [accent("--- Work Experience ---"), br()];
    for (const item of ctx.dict.experience.items) {
      lines.push(success(`${item.role} @ ${item.company}`));
      lines.push(muted(`  ${item.period} | ${item.location}`));
      lines.push(text(`  ${item.description}`));
      lines.push(muted(`  Tech: ${item.tech.join(", ")}`));
      lines.push(br());
    }
    return lines;
  },
};

const projects: CommandDefinition = {
  name: "projects",
  description: "Featured projects",
  execute: (_, ctx) => {
    const lines: OutputLine[] = [accent("--- Featured Projects ---"), br()];
    for (const item of ctx.dict.projects.items) {
      lines.push(success(`${item.title} (${item.type})`));
      lines.push(text(`  ${item.description}`));
      lines.push(muted(`  URL: ${item.url}`));
      lines.push(muted(`  Tech: ${item.tech.join(", ")}`));
      lines.push(br());
    }
    return lines;
  },
};

const skills: CommandDefinition = {
  name: "skills",
  description: "Tech stack",
  execute: (_, ctx) => {
    const lines: OutputLine[] = [accent("--- Tech Stack ---"), br()];
    for (const cat of ctx.dict.skills.categories) {
      lines.push(success(cat.name));
      lines.push(text(`  ${cat.skills.map((s) => s.name).join(", ")}`));
      lines.push(br());
    }
    return lines;
  },
};

const contact: CommandDefinition = {
  name: "contact",
  description: "Contact information",
  execute: (_, ctx) => {
    const lines: OutputLine[] = [accent("--- Contact ---"), br()];
    for (const item of ctx.dict.contact.items) {
      lines.push(text(`  ${item.type}: ${item.value}`));
    }
    return lines;
  },
};

const ls: CommandDefinition = {
  name: "ls",
  description: "List available files",
  execute: () => [
    accent("about.txt    experience.log    projects/"),
    accent("skills.json  contact.md        resume.pdf"),
  ],
};

const history: CommandDefinition = {
  name: "history",
  description: "Show command history",
  execute: (_, ctx) =>
    ctx.history.map((cmd, i) => text(`  ${(i + 1).toString().padStart(3)}  ${cmd}`)),
};

const clear: CommandDefinition = {
  name: "clear",
  description: "Clear terminal",
  execute: () => [],
};

const sudoHireMe: CommandDefinition = {
  name: "sudo hire-me",
  description: "Hire me!",
  execute: (_, ctx) => {
    ctx.triggerMailto(ctx.dict.contact.items.find((i) => i.type === "Email")?.href ?? "mailto:ynessafe@gmail.com");
    return [
      success("Excellent decision! Opening email client..."),
      text("Looking forward to hearing from you!"),
    ];
  },
};

const catResume: CommandDefinition = {
  name: "cat resume.pdf",
  description: "Download my resume",
  execute: (_, ctx) => {
    ctx.triggerDownload("/pdf/cv.pdf");
    return [success("Downloading resume.pdf...")];
  },
};

const echo: CommandDefinition = {
  name: "echo",
  description: "Echo text back",
  execute: (args) => [text(args.join(" "))],
};

const sudoRm: CommandDefinition = {
  name: "sudo rm -rf /",
  description: "Nice try",
  execute: () => [
    error("Nice try! Permission denied."),
    text("This portfolio is indestructible."),
  ],
};

const coffee: CommandDefinition = {
  name: "coffee",
  description: "Brew some coffee",
  execute: () => [
    text("    ( ("),
    text("     ) )"),
    text("  ._______."),
    text("  |       |]"),
    text("  \\       /"),
    text("   `-----'"),
    br(),
    text("Brewing..."),
    error("Error: coffee.exe not found. Try tea instead?"),
  ],
};

const matrix: CommandDefinition = {
  name: "matrix",
  description: "Enter the Matrix",
  execute: (_, ctx) => {
    ctx.triggerMatrix();
    return [success("Entering the Matrix...")];
  },
};

const neofetch: CommandDefinition = {
  name: "neofetch",
  description: "System information",
  execute: () => {
    const startYear = 2018;
    const yearsExp = new Date().getFullYear() - startYear;
    return [
      accent("  visitor@youssef"),
      accent("  -----------------"),
      text(`  OS:        Next.js 16 (App Router)`),
      text(`  Shell:     React 19`),
      text(`  Terminal:  Portfolio v2`),
      text(`  Language:  TypeScript 5`),
      text(`  Styling:   Tailwind CSS 4`),
      text(`  DB:        PostgreSQL (Prisma)`),
      text(`  Uptime:    ${yearsExp}+ years coding`),
      text(`  Packages:  Framer Motion, Zod, Vitest`),
    ];
  },
};

const ping: CommandDefinition = {
  name: "ping",
  description: "Ping a host",
  execute: (args) => {
    const target = args[0]?.toLowerCase();
    if (target === "youssef") {
      return [
        success("PING youssef (127.0.0.1): 56 data bytes"),
        success("Reply from Youssef: I'm available! Latency: 0ms"),
      ];
    }
    return [
      text(`Why would you ping ${target || "nothing"} from my portfolio?`),
      muted("Try 'ping youssef' instead"),
    ];
  },
};

const exit: CommandDefinition = {
  name: "exit",
  description: "Exit terminal",
  execute: () => [
    text("There is no escape..."),
    text("Just kidding. But seriously, hire me first?"),
  ],
};

const date: CommandDefinition = {
  name: "date",
  description: "Show current date",
  execute: () => {
    const now = new Date();
    const startYear = 2018;
    const years = now.getFullYear() - startYear;
    return [
      text(now.toLocaleString()),
      br(),
      muted(`Fun fact: I've been coding for ${years}+ years (since ${startYear})`),
    ];
  },
};

export const allCommands: CommandDefinition[] = [
  helpCommand,
  whoami,
  about,
  experience,
  projects,
  skills,
  contact,
  ls,
  history,
  clear,
  sudoHireMe,
  catResume,
  echo,
  sudoRm,
  coffee,
  matrix,
  neofetch,
  ping,
  exit,
  date,
];

export function buildRegistry() {
  const registry = createRegistry(allCommands);
  registryRef = registry;
  return registry;
}
```

```ts
// src/app/components/view-mode/commands/index.ts
export { allCommands, buildRegistry } from "./commands";
export { createRegistry, type CommandContext, type OutputLine, type CommandDefinition, type CommandRegistry } from "./registry";
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/components/view-mode/commands/__tests__/commands.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/components/view-mode/commands/commands.ts src/app/components/view-mode/commands/index.ts src/app/components/view-mode/commands/__tests__/commands.test.ts
git commit -m "feat(terminal): add all portfolio and fun commands with tests"
```

---

### Task 3: useTerminal Hook (TDD)

**Files:**
- Create: `src/app/components/view-mode/hooks/useTerminal.ts`
- Create: `src/app/components/view-mode/hooks/__tests__/useTerminal.test.ts`

**Step 1: Write the failing test**

```ts
// src/app/components/view-mode/hooks/__tests__/useTerminal.test.ts
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
    expect(result.output.some((l) => l.content.includes("Excellent"))).toBe(true);
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
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/components/view-mode/hooks/__tests__/useTerminal.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

```ts
// src/app/components/view-mode/hooks/useTerminal.ts
import { useState, useCallback, useRef } from "react";
import type { CommandRegistry, CommandContext, OutputLine } from "../commands";

export interface TerminalLine {
  id: number;
  type: "input" | "output";
  content?: string;
  output?: OutputLine[];
}

export interface TerminalSession {
  lines: TerminalLine[];
  history: string[];
}

// Multi-word commands that should be matched as a whole (order: longest first)
const MULTI_WORD_COMMANDS = ["sudo hire-me", "sudo rm -rf /", "cat resume.pdf"];

export interface ExecuteResult {
  output: OutputLine[];
  isClear: boolean;
}

export function executeCommand(
  raw: string,
  registry: CommandRegistry,
  ctx: CommandContext,
): ExecuteResult {
  const input = raw.trim();
  if (!input) return { output: [], isClear: false };

  // Check multi-word commands first
  for (const multi of MULTI_WORD_COMMANDS) {
    if (input.toLowerCase() === multi) {
      const cmd = registry.get(multi);
      if (cmd) {
        return { output: cmd.execute([], ctx), isClear: multi === "clear" };
      }
    }
  }

  // Single-word command + args
  const parts = input.split(/\s+/);
  const name = parts[0].toLowerCase();
  const args = parts.slice(1);

  const cmd = registry.get(name);
  if (!cmd) {
    return {
      output: [
        { type: "error", content: `command not found: ${name}. Type 'help' for available commands.` },
      ],
      isClear: false,
    };
  }

  return { output: cmd.execute(args, ctx), isClear: name === "clear" };
}

export function navigateHistory(
  history: string[],
  currentIndex: number,
  direction: "up" | "down",
): { index: number; value: string } {
  if (history.length === 0) return { index: -1, value: "" };

  if (direction === "up") {
    if (currentIndex === -1) {
      const idx = history.length - 1;
      return { index: idx, value: history[idx] };
    }
    if (currentIndex > 0) {
      const idx = currentIndex - 1;
      return { index: idx, value: history[idx] };
    }
    return { index: currentIndex, value: history[currentIndex] };
  }

  // down
  if (currentIndex < history.length - 1) {
    const idx = currentIndex + 1;
    return { index: idx, value: history[idx] };
  }
  return { index: -1, value: "" };
}

let lineIdCounter = 0;
function nextLineId() {
  return ++lineIdCounter;
}

export function useTerminal(registry: CommandRegistry, ctx: CommandContext) {
  const [session, setSession] = useState<TerminalSession>({
    lines: [],
    history: [],
  });
  const [input, setInput] = useState("");
  const historyIndexRef = useRef(-1);

  const execute = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      const updatedHistory = [...session.history, trimmed];
      const context: CommandContext = { ...ctx, history: updatedHistory };
      const result = executeCommand(trimmed, registry, context);

      if (result.isClear) {
        setSession((s) => ({ lines: [], history: [...s.history, trimmed] }));
      } else {
        setSession((s) => ({
          lines: [
            ...s.lines,
            { id: nextLineId(), type: "input", content: trimmed },
            ...(result.output.length > 0
              ? [{ id: nextLineId(), type: "output" as const, output: result.output }]
              : []),
          ],
          history: [...s.history, trimmed],
        }));
      }

      setInput("");
      historyIndexRef.current = -1;
    },
    [session.history, registry, ctx],
  );

  const handleHistoryNav = useCallback(
    (direction: "up" | "down") => {
      const { index, value } = navigateHistory(
        session.history,
        historyIndexRef.current,
        direction,
      );
      historyIndexRef.current = index;
      setInput(value);
    },
    [session.history],
  );

  const autocomplete = useCallback(
    (partial: string) => {
      if (!partial) return partial;
      const names = registry.commandNames();
      const match = names.find((n) => n.startsWith(partial.toLowerCase()));
      return match ?? partial;
    },
    [registry],
  );

  return {
    session,
    input,
    setInput,
    execute,
    handleHistoryNav,
    autocomplete,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/components/view-mode/hooks/__tests__/useTerminal.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/components/view-mode/hooks/useTerminal.ts src/app/components/view-mode/hooks/__tests__/useTerminal.test.ts
git commit -m "feat(terminal): add useTerminal hook with command execution and history"
```

---

### Task 4: ViewModeContext + ViewModeProvider

**Files:**
- Create: `src/app/components/view-mode/ViewModeContext.ts`
- Create: `src/app/components/view-mode/ViewModeProvider.tsx`

No unit test — integration component. Verified by build + manual test.

**Step 1: Write context**

```ts
// src/app/components/view-mode/ViewModeContext.ts
"use client";

import { createContext, useContext } from "react";

export type ViewMode = "designer" | "dev";

interface ViewModeContextType {
  mode: ViewMode;
  toggleMode: () => void;
}

export const ViewModeContext = createContext<ViewModeContextType>({
  mode: "designer",
  toggleMode: () => {},
});

export function useViewMode() {
  return useContext(ViewModeContext);
}
```

**Step 2: Write provider**

```tsx
// src/app/components/view-mode/ViewModeProvider.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { ViewModeContext, type ViewMode } from "./ViewModeContext";

const STORAGE_KEY = "portfolio-view-mode";

export default function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ViewMode>("designer");

  // Restore from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dev" || stored === "designer") {
      setMode(stored);
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === "designer" ? "dev" : "designer";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <ViewModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/components/view-mode/ViewModeContext.ts src/app/components/view-mode/ViewModeProvider.tsx
git commit -m "feat(terminal): add ViewModeContext and ViewModeProvider with localStorage persistence"
```

---

### Task 5: ViewModeToggle Pill

**Files:**
- Create: `src/app/components/view-mode/ViewModeToggle.tsx`

**Step 1: Write implementation**

This is the Figma-style fixed pill at bottom-center. Two segments: a design icon (paintbrush) and code icon (`</>`). Uses Framer Motion for the sliding indicator.

```tsx
// src/app/components/view-mode/ViewModeToggle.tsx
"use client";

import { motion } from "framer-motion";
import { useViewMode } from "./ViewModeContext";
import { FiPenTool, FiTerminal } from "react-icons/fi";

export default function ViewModeToggle() {
  const { mode, toggleMode } = useViewMode();
  const isDev = mode === "dev";

  return (
    <div className="fixed bottom-[4.267vw] tablet:bottom-[2vw] desktop:bottom-[0.833vw] left-1/2 -translate-x-1/2 z-40">
      <button
        onClick={toggleMode}
        className="relative flex items-center bg-bg-secondary/90 backdrop-blur-lg border border-border-subtle rounded-full p-[1.067vw] tablet:p-[0.5vw] desktop:p-[0.208vw] cursor-pointer"
        aria-label={`Switch to ${isDev ? "designer" : "developer"} mode`}
      >
        {/* Sliding indicator */}
        <motion.div
          className="absolute top-[1.067vw] tablet:top-[0.5vw] desktop:top-[0.208vw] h-[8.533vw] tablet:h-[4vw] desktop:h-[1.667vw] w-[8.533vw] tablet:w-[4vw] desktop:w-[1.667vw] bg-accent-cyan/20 border border-accent-cyan/40 rounded-full"
          animate={{ x: isDev ? "100%" : "0%" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />

        {/* Designer icon */}
        <div
          className={`relative z-10 flex items-center justify-center w-[8.533vw] h-[8.533vw] tablet:w-[4vw] tablet:h-[4vw] desktop:w-[1.667vw] desktop:h-[1.667vw] rounded-full transition-colors ${
            !isDev ? "text-accent-cyan" : "text-text-muted"
          }`}
        >
          <FiPenTool className="w-[4.267vw] h-[4.267vw] tablet:w-[2vw] tablet:h-[2vw] desktop:w-[0.833vw] desktop:h-[0.833vw]" />
        </div>

        {/* Dev icon */}
        <div
          className={`relative z-10 flex items-center justify-center w-[8.533vw] h-[8.533vw] tablet:w-[4vw] tablet:h-[4vw] desktop:w-[1.667vw] desktop:h-[1.667vw] rounded-full transition-colors ${
            isDev ? "text-accent-cyan" : "text-text-muted"
          }`}
        >
          <FiTerminal className="w-[4.267vw] h-[4.267vw] tablet:w-[2vw] tablet:h-[2vw] desktop:w-[0.833vw] desktop:h-[0.833vw]" />
        </div>
      </button>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/components/view-mode/ViewModeToggle.tsx
git commit -m "feat(terminal): add Figma-style ViewModeToggle pill"
```

---

### Task 6: InteractiveTerminal Component

**Files:**
- Create: `src/app/components/view-mode/InteractiveTerminal.tsx`

**Step 1: Write implementation**

Full-screen terminal with input, output rendering, auto-scroll, and keyboard handling.

```tsx
// src/app/components/view-mode/InteractiveTerminal.tsx
"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import type { IDictionary } from "@/app/models/IDictionary";
import { useTerminal } from "./hooks/useTerminal";
import { buildRegistry, type CommandContext, type OutputLine } from "./commands";

interface InteractiveTerminalProps {
  dict: Pick<IDictionary, "hero" | "about" | "experience" | "projects" | "skills" | "contact">;
  onTriggerMatrix: () => void;
}

const PROMPT = "visitor@youssef:~$ ";

const WELCOME_LINES: OutputLine[] = [
  { type: "accent", content: "Welcome to Youssef's Portfolio Terminal v2.0" },
  { type: "muted", content: "Type 'help' for a list of available commands." },
  { type: "break", content: "" },
];

function OutputLineComponent({ line }: { line: OutputLine }) {
  const colorClass = {
    text: "text-foreground",
    error: "text-red-400",
    success: "text-accent-emerald",
    accent: "text-accent-cyan",
    muted: "text-text-muted",
    break: "",
  }[line.type];

  if (line.type === "break") return <div className="h-[2.667vw] tablet:h-[1.25vw] desktop:h-[0.521vw]" />;

  return (
    <div className={`${colorClass} whitespace-pre-wrap break-all`}>
      {line.content}
    </div>
  );
}

export default function InteractiveTerminal({ dict, onTriggerMatrix }: InteractiveTerminalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const registry = useMemo(() => buildRegistry(), []);

  const triggerDownload = useCallback((path: string) => {
    const a = document.createElement("a");
    a.href = path;
    a.download = "";
    a.click();
  }, []);

  const triggerMailto = useCallback((href: string) => {
    window.open(href, "_blank");
  }, []);

  const ctx: CommandContext = useMemo(
    () => ({
      dict,
      history: [],
      triggerMatrix: onTriggerMatrix,
      triggerDownload,
      triggerMailto,
    }),
    [dict, onTriggerMatrix, triggerDownload, triggerMailto],
  );

  const { session, input, setInput, execute, handleHistoryNav, autocomplete } =
    useTerminal(registry, ctx);

  // Auto-scroll on new output
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [session.lines]);

  // Focus input on mount and click
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        execute(input);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handleHistoryNav("up");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleHistoryNav("down");
      } else if (e.key === "Tab") {
        e.preventDefault();
        const completed = autocomplete(input);
        if (completed !== input) setInput(completed);
      }
    },
    [input, execute, handleHistoryNav, autocomplete, setInput],
  );

  return (
    <section
      className="min-h-screen flex flex-col bg-background pt-[16vw] tablet:pt-[8vw] desktop:pt-[3.646vw]"
      onClick={handleContainerClick}
    >
      {/* Terminal header bar */}
      <div className="flex items-center gap-[2.133vw] tablet:gap-[1vw] desktop:gap-[0.417vw] bg-bg-tertiary px-[4.267vw] py-[2.667vw] tablet:px-[2vw] tablet:py-[1.25vw] desktop:px-[0.833vw] desktop:py-[0.521vw] border-b border-border-subtle">
        <div className="flex gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw]" aria-hidden="true">
          <div className="w-[2.667vw] h-[2.667vw] tablet:w-[1.25vw] tablet:h-[1.25vw] desktop:w-[0.521vw] desktop:h-[0.521vw] rounded-full bg-[#FF5F57]" />
          <div className="w-[2.667vw] h-[2.667vw] tablet:w-[1.25vw] tablet:h-[1.25vw] desktop:w-[0.521vw] desktop:h-[0.521vw] rounded-full bg-[#FFBD2E]" />
          <div className="w-[2.667vw] h-[2.667vw] tablet:w-[1.25vw] tablet:h-[1.25vw] desktop:w-[0.521vw] desktop:h-[0.521vw] rounded-full bg-[#28CA41]" />
        </div>
        <span className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-text-muted font-mono">
          visitor@youssef — portfolio
        </span>
      </div>

      {/* Terminal body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-[4.267vw] tablet:p-[2vw] desktop:p-[0.833vw] font-mono text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] leading-[1.8]"
      >
        {/* Welcome message */}
        {WELCOME_LINES.map((line, i) => (
          <OutputLineComponent key={`welcome-${i}`} line={line} />
        ))}

        {/* Session lines */}
        {session.lines.map((line) =>
          line.type === "input" ? (
            <div key={line.id} className="text-text-muted">
              <span className="text-accent-emerald">{PROMPT}</span>
              {line.content}
            </div>
          ) : (
            <div key={line.id}>
              {line.output?.map((ol, i) => (
                <OutputLineComponent key={`${line.id}-${i}`} line={ol} />
              ))}
            </div>
          ),
        )}

        {/* Input line */}
        <div className="flex items-center">
          <span className="text-accent-emerald whitespace-nowrap">{PROMPT}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-foreground caret-accent-cyan font-mono text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw]"
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            aria-label="Terminal input"
          />
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/components/view-mode/InteractiveTerminal.tsx
git commit -m "feat(terminal): add InteractiveTerminal full-screen component"
```

---

### Task 7: Integrate into Public Layout and Homepage

**Files:**
- Modify: `src/app/(public)/layout.tsx`
- Modify: `src/app/(public)/page.tsx`

**Step 1: Update layout — add ViewModeProvider and ViewModeToggle**

The layout currently wraps with `EasterEggsProvider`. Add `ViewModeProvider` inside it, and render `ViewModeToggle`.

```tsx
// src/app/(public)/layout.tsx — full replacement
import { getDictionary } from "@/get-dictionary";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import ScrollProgress from "@/app/components/ui/ScrollProgress";
import EasterEggsProvider from "@/app/components/easter-eggs/EasterEggsProvider";
import ViewModeProvider from "@/app/components/view-mode/ViewModeProvider";
import ViewModeToggle from "@/app/components/view-mode/ViewModeToggle";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dict = await getDictionary();

  return (
    <EasterEggsProvider>
      <ViewModeProvider>
        <main className="overflow-x-clip">
          <ScrollProgress />
          <Header {...dict.layout.header} />
          {children}
          <Footer {...dict.layout.footer} />
        </main>
        <ViewModeToggle />
      </ViewModeProvider>
    </EasterEggsProvider>
  );
}
```

**Step 2: Update homepage — conditional rendering**

The homepage is a server component. We need a client wrapper to read the view mode context and conditionally render. Create a thin client wrapper.

Create: `src/app/(public)/HomeContent.tsx`

```tsx
// src/app/(public)/HomeContent.tsx
"use client";

import { useViewMode } from "@/app/components/view-mode/ViewModeContext";
import { useEasterEggs } from "@/app/components/easter-eggs/EasterEggsContext";
import InteractiveTerminal from "@/app/components/view-mode/InteractiveTerminal";
import type { IDictionary } from "@/app/models/IDictionary";

interface HomeContentProps {
  dict: Pick<IDictionary, "hero" | "about" | "experience" | "projects" | "skills" | "contact">;
  designerContent: React.ReactNode;
}

export default function HomeContent({ dict, designerContent }: HomeContentProps) {
  const { mode } = useViewMode();

  // We need access to the matrix trigger from easter eggs
  // For now, we'll create a simple callback
  const triggerMatrix = useEasterEggs();

  if (mode === "dev") {
    return (
      <InteractiveTerminal
        dict={dict}
        onTriggerMatrix={() => {
          // Matrix rain is managed by EasterEggsProvider
          // We can trigger it via the konami code internally,
          // or we add a triggerMatrix to the easter eggs context
        }}
      />
    );
  }

  return <>{designerContent}</>;
}
```

Actually, we need to expose `triggerMatrix` from the EasterEggs context. This requires a small modification.

Modify: `src/app/components/easter-eggs/EasterEggsContext.ts` — add `triggerMatrix` to context

Modify: `src/app/components/easter-eggs/EasterEggsProvider.tsx` — expose `triggerMatrix` callback

Then update `HomeContent.tsx` to use it.

```tsx
// Updated src/app/(public)/HomeContent.tsx
"use client";

import { useViewMode } from "@/app/components/view-mode/ViewModeContext";
import { useEasterEggs } from "@/app/components/easter-eggs/EasterEggsContext";
import InteractiveTerminal from "@/app/components/view-mode/InteractiveTerminal";
import type { IDictionary } from "@/app/models/IDictionary";

interface HomeContentProps {
  dict: Pick<IDictionary, "hero" | "about" | "experience" | "projects" | "skills" | "contact">;
  designerContent: React.ReactNode;
}

export default function HomeContent({ dict, designerContent }: HomeContentProps) {
  const { mode } = useViewMode();
  const { triggerMatrix } = useEasterEggs();

  if (mode === "dev") {
    return <InteractiveTerminal dict={dict} onTriggerMatrix={triggerMatrix} />;
  }

  return <>{designerContent}</>;
}
```

Update `src/app/(public)/page.tsx`:

```tsx
// src/app/(public)/page.tsx
import { getDictionary } from "@/get-dictionary";
import HeroSection from "@/app/_sections/portfolio/HeroSection";
import AboutSection from "@/app/_sections/portfolio/AboutSection";
import ExperienceSection from "@/app/_sections/portfolio/ExperienceSection";
import ProjectsSection from "@/app/_sections/portfolio/ProjectsSection";
import SkillsSection from "@/app/_sections/portfolio/SkillsSection";
import ContactSection from "@/app/_sections/portfolio/ContactSection";
import HomeContent from "./HomeContent";

export default async function Home() {
  const dict = await getDictionary();

  const designerContent = (
    <>
      <HeroSection {...dict.hero} />
      <AboutSection {...dict.about} />
      <ExperienceSection {...dict.experience} />
      <ProjectsSection {...dict.projects} />
      <SkillsSection {...dict.skills} />
      <ContactSection {...dict.contact} />
    </>
  );

  return (
    <HomeContent
      dict={{
        hero: dict.hero,
        about: dict.about,
        experience: dict.experience,
        projects: dict.projects,
        skills: dict.skills,
        contact: dict.contact,
      }}
      designerContent={designerContent}
    />
  );
}
```

**Step 3: Update EasterEggs context to expose triggerMatrix**

In `src/app/components/easter-eggs/EasterEggsContext.ts`, add `triggerMatrix: () => void` to the interface and default.

In `src/app/components/easter-eggs/EasterEggsProvider.tsx`, add a `triggerMatrix` callback that sets `showMatrix` to true, and pass it in the context value.

**Step 4: Hide footer in dev mode**

Update `src/app/components/layout/Footer/index.tsx`:
- Import `useViewMode`
- Return `null` early when mode is `"dev"`

**Step 5: Commit**

```bash
git add src/app/components/view-mode/ViewModeContext.ts src/app/components/view-mode/ViewModeProvider.tsx src/app/components/view-mode/ViewModeToggle.tsx src/app/components/view-mode/InteractiveTerminal.tsx "src/app/(public)/layout.tsx" "src/app/(public)/page.tsx" "src/app/(public)/HomeContent.tsx" src/app/components/easter-eggs/EasterEggsContext.ts src/app/components/easter-eggs/EasterEggsProvider.tsx src/app/components/layout/Footer/index.tsx
git commit -m "feat(terminal): integrate ViewMode toggle, InteractiveTerminal, and conditional rendering"
```

---

### Task 8: Smoke Test + Verify

**Step 1: Run all tests**

Run: `npm test`
Expected: All existing + new tests pass

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Manual verification**

Run: `npm run dev`

Checklist:
- [ ] Page loads in designer mode by default
- [ ] Toggle pill visible at bottom-center
- [ ] Clicking toggle switches to terminal mode
- [ ] Terminal shows welcome message
- [ ] Can type commands and see output
- [ ] `help` lists all commands
- [ ] `whoami`, `about`, `experience`, `projects`, `skills`, `contact` show dict data
- [ ] `ls` shows file listing
- [ ] `history` shows command history
- [ ] `clear` clears terminal
- [ ] `sudo hire-me` opens email
- [ ] `cat resume.pdf` triggers download (needs file in /public/pdf/cv.pdf)
- [ ] `echo hello` echoes back
- [ ] Fun commands work: `coffee`, `neofetch`, `matrix`, `ping`, `exit`, `date`, `sudo rm -rf /`
- [ ] `matrix` triggers Matrix rain effect
- [ ] Up/Down arrows navigate history
- [ ] Tab autocompletes
- [ ] Toggle back to designer mode — portfolio sections appear
- [ ] Toggle back to dev mode — terminal state preserved
- [ ] Refresh page — mode persisted from localStorage
- [ ] Header visible in both modes
- [ ] Footer hidden in dev mode
- [ ] All existing easter eggs still work in designer mode

**Step 4: Final commit if fixes needed**

```bash
git commit -m "feat(terminal): final integration fixes"
```

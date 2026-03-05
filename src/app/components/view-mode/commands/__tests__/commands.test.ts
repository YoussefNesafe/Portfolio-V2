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
        terminal: { command: "cat about.txt", lines: ["Line one.", "Line two."] },
        stats: [{ value: 6, suffix: "+", label: "Years" }],
      },
      experience: {
        sectionLabel: "// experience",
        title: "Experience",
        items: [{
          company: "Acme", role: "Senior Dev", period: "2022 - Present",
          location: "Dubai", description: "Desc", achievements: ["Built stuff"], tech: ["React", "TypeScript"],
        }],
      },
      projects: {
        sectionLabel: "// projects",
        title: "Projects",
        items: [{
          id: "proj1", title: "Cool Project", type: "Web App", description: "A cool project",
          image: "/img.png", url: "https://example.com", highlights: ["Fast"], tech: ["Next.js"],
        }],
      },
      skills: {
        sectionLabel: "// skills",
        title: "Skills",
        categories: [{ name: "Frontend", skills: [{ name: "React", icon: "SiReact", color: "#61DAFB" }] }],
      },
      contact: {
        sectionLabel: "// contact",
        title: "Contact",
        description: "Get in touch",
        items: [{ type: "Email", value: "test@test.com", href: "mailto:test@test.com", icon: "FiMail" }],
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
    const output = registry.get("whoami")!.execute([], makeContext());
    const text = output.map((l) => l.content).join(" ");
    expect(text).toContain("Youssef Nesafe");
    expect(text).toContain("Senior");
  });

  it("about returns about text", () => {
    const output = registry.get("about")!.execute([], makeContext());
    const text = output.map((l) => l.content).join(" ");
    expect(text).toContain("Line one.");
  });

  it("experience returns company and role", () => {
    const output = registry.get("experience")!.execute([], makeContext());
    const text = output.map((l) => l.content).join(" ");
    expect(text).toContain("Acme");
    expect(text).toContain("Senior Dev");
  });

  it("projects returns project title", () => {
    const output = registry.get("projects")!.execute([], makeContext());
    const text = output.map((l) => l.content).join(" ");
    expect(text).toContain("Cool Project");
  });

  it("skills returns category and skill names", () => {
    const output = registry.get("skills")!.execute([], makeContext());
    const text = output.map((l) => l.content).join(" ");
    expect(text).toContain("Frontend");
    expect(text).toContain("React");
  });

  it("contact returns contact info", () => {
    const output = registry.get("contact")!.execute([], makeContext());
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

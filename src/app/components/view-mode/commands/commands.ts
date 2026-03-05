import type {
  CommandDefinition,
  CommandContext,
  CommandRegistry,
  OutputLine,
} from "./registry";
import { createRegistry } from "./registry";

/* ── Output helpers ─────────────────────────────────────────────── */

const text = (content: string): OutputLine => ({ type: "text", content });
const accent = (content: string): OutputLine => ({ type: "accent", content });
const muted = (content: string): OutputLine => ({ type: "muted", content });
const success = (content: string): OutputLine => ({ type: "success", content });
const error = (content: string): OutputLine => ({ type: "error", content });
const br = (): OutputLine => ({ type: "break", content: "" });

/* ── Registry ref (so help can list all commands) ───────────────── */

let registryRef: CommandRegistry | null = null;

/* ── Commands ───────────────────────────────────────────────────── */

const helpCmd: CommandDefinition = {
  name: "help",
  description: "List all available commands",
  execute: () => {
    const lines = registryRef
      ? registryRef.helpLines()
      : allCommands.map((cmd) => {
          const padded = cmd.name.padEnd(20);
          return `  ${padded}${cmd.description}`;
        });
    return [
      accent("Available commands:"),
      br(),
      ...lines.map((l) => text(l)),
      br(),
      muted("Type a command and press Enter to execute."),
    ];
  },
};

const whoamiCmd: CommandDefinition = {
  name: "whoami",
  description: "Display developer identity",
  execute: (_args, ctx) => {
    const { name, titlePrefix, titleHighlight, titleSuffix, tagline } = ctx.dict.hero;
    return [
      accent(name),
      text(`${titlePrefix} ${titleHighlight} ${titleSuffix}`),
      br(),
      muted(tagline),
    ];
  },
};

const aboutCmd: CommandDefinition = {
  name: "about",
  description: "Learn about the developer",
  execute: (_args, ctx) => {
    const { terminal } = ctx.dict.about;
    return [
      accent(`$ ${terminal.command}`),
      br(),
      ...terminal.lines.map((line) => text(line)),
    ];
  },
};

const experienceCmd: CommandDefinition = {
  name: "experience",
  description: "View work experience",
  execute: (_args, ctx) => {
    const output: OutputLine[] = [];
    for (const item of ctx.dict.experience.items) {
      output.push(accent(`${item.role} @ ${item.company}`));
      output.push(muted(`${item.period} | ${item.location}`));
      output.push(text(item.description));
      if (item.tech.length > 0) {
        output.push(muted(`Tech: ${item.tech.join(", ")}`));
      }
      output.push(br());
    }
    return output;
  },
};

const projectsCmd: CommandDefinition = {
  name: "projects",
  description: "Browse portfolio projects",
  execute: (_args, ctx) => {
    const output: OutputLine[] = [];
    for (const item of ctx.dict.projects.items) {
      output.push(accent(item.title));
      output.push(muted(`[${item.type}] ${item.url}`));
      output.push(text(item.description));
      if (item.tech.length > 0) {
        output.push(muted(`Tech: ${item.tech.join(", ")}`));
      }
      output.push(br());
    }
    return output;
  },
};

const skillsCmd: CommandDefinition = {
  name: "skills",
  description: "List technical skills",
  execute: (_args, ctx) => {
    const output: OutputLine[] = [];
    for (const category of ctx.dict.skills.categories) {
      output.push(accent(category.name));
      output.push(text(category.skills.map((s) => s.name).join(", ")));
      output.push(br());
    }
    return output;
  },
};

const contactCmd: CommandDefinition = {
  name: "contact",
  description: "Show contact information",
  execute: (_args, ctx) => {
    const output: OutputLine[] = [accent("Contact Information:"), br()];
    for (const item of ctx.dict.contact.items) {
      output.push(text(`${item.type}: ${item.value}`));
    }
    return output;
  },
};

const lsCmd: CommandDefinition = {
  name: "ls",
  description: "List directory contents",
  execute: () => [
    accent("about.txt"),
    accent("experience.log"),
    accent("projects/"),
    accent("skills.json"),
    accent("contact.md"),
    accent("resume.pdf"),
  ],
};

const historyCmd: CommandDefinition = {
  name: "history",
  description: "Show command history",
  execute: (_args, ctx) =>
    ctx.history.map((cmd, i) => muted(`  ${i + 1}  ${cmd}`)),
};

const clearCmd: CommandDefinition = {
  name: "clear",
  description: "Clear the terminal screen",
  execute: () => [],
};

const sudoHireMeCmd: CommandDefinition = {
  name: "sudo hire-me",
  description: "Send a hire request",
  execute: (_args, ctx) => {
    const emailItem = ctx.dict.contact.items.find((i) => i.type === "Email");
    const href = emailItem?.href ?? "mailto:hello@example.com";
    ctx.triggerMailto(href);
    return [
      success("Opening email client..."),
      text("sudo access granted. Sending hire request!"),
    ];
  },
};

const catResumeCmd: CommandDefinition = {
  name: "cat resume.pdf",
  description: "Download resume / CV",
  execute: (_args, ctx) => {
    ctx.triggerDownload("/pdf/cv.pdf");
    return [success("Downloading resume..."), muted("cat: resume.pdf sent to stdout (your downloads folder)")];
  },
};

const echoCmd: CommandDefinition = {
  name: "echo",
  description: "Print text to the terminal",
  execute: (args) => [text(args.join(" "))],
};

const sudoRmCmd: CommandDefinition = {
  name: "sudo rm -rf /",
  description: "Try to delete everything",
  execute: () => [
    error("Nice try! Permission denied. This portfolio is indestructible."),
    muted("(rm: cannot remove '/': Operation not permitted)"),
  ],
};

const coffeeCmd: CommandDefinition = {
  name: "coffee",
  description: "Brew a fresh cup of coffee",
  execute: () => [
    text("        ( ("),
    text("         ) )"),
    text("      ........"),
    text("      |      |]"),
    text("      \\      /"),
    text("       `----'"),
    br(),
    error("Error: coffee.exe not found. Try tea instead?"),
  ],
};

const matrixCmd: CommandDefinition = {
  name: "matrix",
  description: "Enter the Matrix",
  execute: (_args, ctx) => {
    ctx.triggerMatrix();
    return [success("Entering the Matrix..."), muted("Follow the white rabbit.")];
  },
};

const neofetchCmd: CommandDefinition = {
  name: "neofetch",
  description: "Display system information",
  execute: (_args, ctx) => [
    accent("youssef@portfolio"),
    muted("-------------------"),
    text(`OS: Next.js 16`),
    text(`Shell: React 19`),
    text(`Language: TypeScript 5`),
    text(`CSS: Tailwind CSS 4`),
    text(`DB: PostgreSQL + Prisma`),
    text(`Theme: ${ctx.dict.hero.name}'s Portfolio`),
    text(`Uptime: since 2018`),
  ],
};

const pingCmd: CommandDefinition = {
  name: "ping",
  description: "Ping a host",
  execute: (args) => {
    const target = args[0] ?? "localhost";
    if (target.toLowerCase() === "youssef") {
      return [
        success("PING youssef (127.0.0.1): 56 data bytes"),
        success("64 bytes: time=1ms"),
        br(),
        accent("Status: available for hire!"),
      ];
    }
    return [
      text(`PING ${target} (93.184.216.34): 56 data bytes`),
      muted("Why ping ${target} when you can ping youssef?"),
      accent("Try: ping youssef"),
    ];
  },
};

const exitCmd: CommandDefinition = {
  name: "exit",
  description: "Exit the terminal",
  execute: () => [
    text("There is no escape... Just kidding."),
    text("But seriously, hire me first?"),
    muted("(The terminal will keep running. You can't get rid of me that easily.)"),
  ],
};

const dateCmd: CommandDefinition = {
  name: "date",
  description: "Show current date and time",
  execute: () => {
    const now = new Date();
    const yearsCoding = now.getFullYear() - 2018;
    return [
      text(now.toLocaleString()),
      br(),
      muted(`Fun fact: That's ${yearsCoding}+ years of coding since 2018!`),
    ];
  },
};

/* ── Exports ────────────────────────────────────────────────────── */

export const allCommands: CommandDefinition[] = [
  helpCmd,
  whoamiCmd,
  aboutCmd,
  experienceCmd,
  projectsCmd,
  skillsCmd,
  contactCmd,
  lsCmd,
  historyCmd,
  clearCmd,
  sudoHireMeCmd,
  catResumeCmd,
  echoCmd,
  sudoRmCmd,
  coffeeCmd,
  matrixCmd,
  neofetchCmd,
  pingCmd,
  exitCmd,
  dateCmd,
];

export function buildRegistry(): CommandRegistry {
  const registry = createRegistry(allCommands);
  registryRef = registry;
  return registry;
}

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

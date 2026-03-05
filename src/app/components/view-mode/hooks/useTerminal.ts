"use client";

import { useState, useRef, useCallback } from "react";
import type {
  CommandRegistry,
  CommandContext,
  OutputLine,
} from "../commands";

/* ── Types ─────────────────────────────────────────────────────── */

export interface TerminalLine {
  id: string;
  command?: string;
  output: OutputLine[];
}

export interface TerminalSession {
  lines: TerminalLine[];
  history: string[];
}

export interface ExecuteResult {
  output: OutputLine[];
  isClear: boolean;
}

/* ── Multi-word commands (checked before splitting on whitespace) ── */

const MULTI_WORD_COMMANDS = ["sudo hire-me", "sudo rm -rf /", "cat resume.pdf"];

/* ── Pure functions ────────────────────────────────────────────── */

export function executeCommand(
  raw: string,
  registry: CommandRegistry,
  ctx: CommandContext,
): ExecuteResult {
  const trimmed = raw.trim();

  if (trimmed === "") {
    return { output: [], isClear: false };
  }

  // Check multi-word commands first (exact match on the full input)
  for (const multiCmd of MULTI_WORD_COMMANDS) {
    if (trimmed === multiCmd) {
      const def = registry.get(multiCmd);
      if (def) {
        return { output: def.execute([], ctx), isClear: false };
      }
    }
  }

  // Split on whitespace: first token is command name, rest are args
  const parts = trimmed.split(/\s+/);
  const name = parts[0];
  const args = parts.slice(1);

  const def = registry.get(name);

  if (!def) {
    return {
      output: [
        {
          type: "error",
          content: `Command not found: ${name}. Type 'help' for available commands.`,
        },
      ],
      isClear: false,
    };
  }

  return {
    output: def.execute(args, ctx),
    isClear: name === "clear",
  };
}

export function navigateHistory(
  history: string[],
  currentIndex: number,
  direction: "up" | "down",
): { index: number; value: string } {
  if (history.length === 0) {
    return { index: -1, value: "" };
  }

  if (direction === "up") {
    if (currentIndex === -1) {
      // Not browsing yet — go to last entry
      const idx = history.length - 1;
      return { index: idx, value: history[idx] };
    }
    if (currentIndex > 0) {
      const idx = currentIndex - 1;
      return { index: idx, value: history[idx] };
    }
    // Already at the oldest — stay
    return { index: 0, value: history[0] };
  }

  // direction === "down"
  if (currentIndex === -1) {
    return { index: -1, value: "" };
  }
  if (currentIndex < history.length - 1) {
    const idx = currentIndex + 1;
    return { index: idx, value: history[idx] };
  }
  // Past the newest — reset
  return { index: -1, value: "" };
}

/* ── React hook ────────────────────────────────────────────────── */

let lineIdCounter = 0;
function nextLineId(): string {
  return `line-${++lineIdCounter}`;
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
      if (trimmed === "") return;

      const contextWithHistory: CommandContext = {
        ...ctx,
        history: [...session.history, trimmed],
      };

      const result = executeCommand(trimmed, registry, contextWithHistory);

      if (result.isClear) {
        setSession((prev) => ({
          lines: [],
          history: [...prev.history, trimmed],
        }));
      } else {
        const newLine: TerminalLine = {
          id: nextLineId(),
          command: trimmed,
          output: result.output,
        };
        setSession((prev) => ({
          lines: [...prev.lines, newLine],
          history: [...prev.history, trimmed],
        }));
      }

      setInput("");
      historyIndexRef.current = -1;
    },
    [registry, ctx, session.history],
  );

  const handleHistoryNav = useCallback(
    (direction: "up" | "down") => {
      const result = navigateHistory(
        session.history,
        historyIndexRef.current,
        direction,
      );
      historyIndexRef.current = result.index;
      setInput(result.value);
    },
    [session.history],
  );

  const autocomplete = useCallback(
    (partial: string): string | null => {
      if (!partial.trim()) return null;
      const names = registry.commandNames();
      const matches = names.filter((n) =>
        n.startsWith(partial.trim().toLowerCase()),
      );
      return matches.length === 1 ? matches[0] : null;
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

"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import type { IDictionary } from "@/app/models/IDictionary";
import { useTerminal } from "./hooks/useTerminal";
import { buildRegistry, type CommandContext, type OutputLine } from "./commands";

interface InteractiveTerminalProps {
  dict: Pick<
    IDictionary,
    "hero" | "about" | "experience" | "projects" | "skills" | "contact"
  >;
}

const PROMPT = "visitor@youssef:~$ ";

const WELCOME_LINES: OutputLine[] = [
  { type: "accent", content: "Welcome to Youssef's Portfolio Terminal v2.0" },
  {
    type: "muted",
    content: "Type 'help' for a list of available commands.",
  },
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

  if (line.type === "break")
    return (
      <div className="h-[2.667vw] tablet:h-[1.25vw] desktop:h-[0.521vw]" />
    );

  return (
    <div className={`${colorClass} whitespace-pre-wrap break-all`}>
      {line.content}
    </div>
  );
}

export default function InteractiveTerminal({
  dict,
}: InteractiveTerminalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
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
      triggerDownload,
      triggerMailto,
    }),
    [dict, triggerDownload, triggerMailto],
  );

  const { session, input, setInput, execute, handleHistoryNav, autocomplete } =
    useTerminal(registry, ctx);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.lines]);

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
        if (completed) setInput(completed);
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
        <div
          className="flex gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw]"
          aria-hidden="true"
        >
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
        className="flex-1 p-[4.267vw] tablet:p-[2vw] desktop:p-[0.833vw] font-mono text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] leading-[1.8]"
      >
        {/* Welcome message */}
        {WELCOME_LINES.map((line, i) => (
          <OutputLineComponent key={`welcome-${i}`} line={line} />
        ))}

        {/* Session lines */}
        {session.lines.map((line) => (
          <div key={line.id}>
            {line.command !== undefined && (
              <div className="text-text-muted">
                <span className="text-accent-emerald">{PROMPT}</span>
                {line.command}
              </div>
            )}
            {line.output.map((ol, i) => (
              <OutputLineComponent key={`${line.id}-${i}`} line={ol} />
            ))}
          </div>
        ))}

        {/* Input line */}
        <div className="flex items-center">
          <span className="text-accent-emerald whitespace-nowrap">
            {PROMPT}
          </span>
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
        <div ref={bottomRef} />
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface TypewriterTextProps {
  lines: { text: string; className?: string }[];
  speed?: number;
  lineDelay?: number;
}

export default function TypewriterText({
  lines,
  speed = 20,
  lineDelay = 200,
}: TypewriterTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();
  const [visibleChars, setVisibleChars] = useState(0);

  const totalChars = lines.reduce((sum, line) => sum + line.text.length, 0);
  const totalWithDelays = totalChars + lines.length * Math.ceil(lineDelay / speed);

  useEffect(() => {
    if (!isInView || prefersReducedMotion) {
      if (prefersReducedMotion) setVisibleChars(totalWithDelays);
      return;
    }

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setVisibleChars(current);
      if (current >= totalWithDelays) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [isInView, prefersReducedMotion, speed, totalWithDelays]);

  let charCount = 0;
  const renderedLines = lines.map((line, lineIndex) => {
    const lineStart = charCount;
    charCount += line.text.length + Math.ceil(lineDelay / speed);

    const delayChars = lineIndex * Math.ceil(lineDelay / speed);
    const adjustedVisible = visibleChars - delayChars;
    const charsToShow = Math.max(0, Math.min(line.text.length, adjustedVisible - lineStart + delayChars));

    return {
      ...line,
      displayText: line.text.slice(0, charsToShow),
      isComplete: charsToShow >= line.text.length,
      hasStarted: charsToShow > 0,
    };
  });

  return (
    <div ref={ref}>
      {renderedLines.map((line, i) => (
        <p key={i} className={line.className}>
          {line.displayText}
          {line.hasStarted && !line.isComplete && (
            <span className="animate-blink-cursor text-accent-cyan">|</span>
          )}
        </p>
      ))}
      {renderedLines.every((l) => l.isComplete) && (
        <span className="animate-blink-cursor text-accent-cyan">_</span>
      )}
    </div>
  );
}

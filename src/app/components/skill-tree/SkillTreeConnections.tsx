"use client";

import { motion } from "framer-motion";
import type { LayoutConnection } from "./tree-layout";

interface SkillTreeConnectionsProps {
  connections: LayoutConnection[];
  highlightedIds: Set<string>;
  width: number;
  height: number;
  animationDelay: number;
}

export default function SkillTreeConnections({
  connections,
  highlightedIds,
  width,
  height,
  animationDelay,
}: SkillTreeConnectionsProps) {
  return (
    <svg
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="pcb-grid"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="10" cy="10" r="0.5" fill="#1a1a2e" />
        </pattern>
        <filter id="trace-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width={width} height={height} fill="url(#pcb-grid)" />
      {connections.map((conn, i) => {
        const isHighlighted = highlightedIds.has(conn.id);
        return (
          <motion.path
            key={conn.id}
            d={conn.path}
            fill="none"
            stroke={conn.color}
            strokeWidth={isHighlighted ? 2.5 : 1.5}
            strokeOpacity={isHighlighted ? 0.9 : 0.25}
            strokeLinecap="square"
            filter={isHighlighted ? "url(#trace-glow)" : undefined}
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              pathLength: {
                duration: 0.5,
                delay: animationDelay + i * 0.02,
              },
              opacity: { duration: 0.2, delay: animationDelay },
            }}
            className="transition-all duration-300"
          />
        );
      })}
    </svg>
  );
}

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
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {connections.map((conn, i) => {
        const isHighlighted = highlightedIds.has(conn.id);
        return (
          <motion.path
            key={conn.id}
            d={conn.path}
            fill="none"
            stroke={conn.color}
            strokeWidth={isHighlighted ? 2 : 1}
            strokeOpacity={isHighlighted ? 0.8 : 0.2}
            filter={isHighlighted ? "url(#glow)" : undefined}
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              pathLength: { duration: 0.6, delay: animationDelay + i * 0.03 },
              opacity: { duration: 0.3, delay: animationDelay },
            }}
            className="transition-all duration-300"
          />
        );
      })}
    </svg>
  );
}

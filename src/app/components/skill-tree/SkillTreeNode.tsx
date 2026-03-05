"use client";

import { motion } from "framer-motion";
import type { LayoutNode } from "./tree-layout";
import type { SkillTier } from "@/app/models/common";
import type { IconType } from "react-icons";
import * as SiIcons from "react-icons/si";

const iconMap = SiIcons as unknown as Record<string, IconType>;

const tierStyles: Record<
  SkillTier,
  { border: string; glow: string; opacity: string; borderStyle: string }
> = {
  expert: {
    border: "border-[0.267vw] tablet:border-[0.125vw] desktop:border-[0.104vw]",
    glow: "shadow-[0_0_12px_var(--node-color)]",
    opacity: "opacity-100",
    borderStyle: "border-solid",
  },
  proficient: {
    border: "border-[0.133vw] tablet:border-[0.063vw] desktop:border-[0.052vw]",
    glow: "shadow-[0_0_6px_var(--node-color)]",
    opacity: "opacity-90",
    borderStyle: "border-solid",
  },
  familiar: {
    border: "border-[0.133vw] tablet:border-[0.063vw] desktop:border-[0.052vw]",
    glow: "",
    opacity: "opacity-60",
    borderStyle: "border-dashed",
  },
};

interface SkillTreeNodeProps {
  node: LayoutNode;
  isHighlighted: boolean;
  isDimmed: boolean;
  onHover: (nodeId: string) => void;
  onLeave: () => void;
  animationDelay: number;
}

export default function SkillTreeNode({
  node,
  isHighlighted,
  isDimmed,
  onHover,
  onLeave,
  animationDelay,
}: SkillTreeNodeProps) {
  const Icon = node.icon ? iconMap[node.icon] : null;

  if (node.type === "core") {
    return (
      <motion.div
        className="absolute flex items-center justify-center rounded-full bg-background border-[0.267vw] tablet:border-[0.125vw] desktop:border-[0.104vw] border-accent-cyan shadow-[0_0_20px_theme(colors.accent-cyan)] w-[16vw] h-[16vw] tablet:w-[7.5vw] tablet:h-[7.5vw] desktop:w-[3.646vw] desktop:h-[3.646vw] cursor-pointer z-10"
        style={{
          left: `${node.x}px`,
          top: `${node.y}px`,
          transform: "translate(-50%, -50%)",
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.3, delay: animationDelay }}
        onMouseEnter={() => onHover(node.id)}
        onMouseLeave={onLeave}
        onClick={() => onHover(node.id)}
      >
        <span className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] font-mono font-bold text-accent-cyan">
          {"</>"}
        </span>
      </motion.div>
    );
  }

  if (node.type === "category") {
    return (
      <motion.div
        className={`absolute flex items-center justify-center rounded-full bg-bg-secondary border-[0.267vw] tablet:border-[0.125vw] desktop:border-[0.104vw] border-accent-purple w-[13.333vw] h-[13.333vw] tablet:w-[6.25vw] tablet:h-[6.25vw] desktop:w-[2.604vw] desktop:h-[2.604vw] cursor-pointer z-10 transition-opacity duration-300 ${isDimmed ? "opacity-30" : "opacity-100"}`}
        style={{
          left: `${node.x}px`,
          top: `${node.y}px`,
          transform: "translate(-50%, -50%)",
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.3, delay: animationDelay }}
        onMouseEnter={() => onHover(node.id)}
        onMouseLeave={onLeave}
        onClick={() => onHover(node.id)}
      >
        <span className="text-[2.133vw] tablet:text-[1vw] desktop:text-[0.417vw] font-mono text-accent-purple text-center leading-tight px-[0.533vw] tablet:px-[0.25vw] desktop:px-[0.104vw]">
          {node.label}
        </span>
      </motion.div>
    );
  }

  // Skill node
  const tier = node.tier ?? "familiar";
  const styles = tierStyles[tier];
  const nodeColor = node.color ?? "#06B6D4";

  return (
    <motion.div
      className="absolute flex flex-col items-center z-10"
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.3, delay: animationDelay }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={onLeave}
      onClick={() => onHover(node.id)}
    >
      <div
        className={`flex items-center justify-center rounded-full bg-bg-secondary ${styles.border} ${styles.borderStyle} ${styles.opacity} ${styles.glow} w-[10.667vw] h-[10.667vw] tablet:w-[5vw] tablet:h-[5vw] desktop:w-[2.083vw] desktop:h-[2.083vw] cursor-pointer transition-all duration-300 ${isDimmed ? "!opacity-20" : ""} ${isHighlighted ? "!opacity-100 scale-110" : ""}`}
        style={
          {
            borderColor: nodeColor,
            "--node-color": nodeColor,
          } as React.CSSProperties
        }
      >
        {Icon && (
          <Icon
            className="w-[4.267vw] h-[4.267vw] tablet:w-[2vw] tablet:h-[2vw] desktop:w-[0.833vw] desktop:h-[0.833vw]"
            style={{ color: nodeColor }}
          />
        )}
      </div>
      <span
        className={`mt-[0.8vw] tablet:mt-[0.375vw] desktop:mt-[0.156vw] text-[2.133vw] tablet:text-[1vw] desktop:text-[0.417vw] font-mono text-text-muted whitespace-nowrap transition-opacity duration-300 ${isDimmed ? "opacity-20" : ""}`}
      >
        {node.label}
      </span>
    </motion.div>
  );
}

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
    border: "border-[0.533vw] tablet:border-[0.25vw] desktop:border-[0.104vw]",
    glow: "shadow-[0_0_8px_var(--node-color)]",
    opacity: "opacity-100",
    borderStyle: "border-solid",
  },
  proficient: {
    border: "border-[0.267vw] tablet:border-[0.125vw] desktop:border-[0.052vw]",
    glow: "shadow-[0_0_4px_var(--node-color)]",
    opacity: "opacity-90",
    borderStyle: "border-solid",
  },
  familiar: {
    border: "border-[0.267vw] tablet:border-[0.125vw] desktop:border-[0.052vw]",
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
        className="absolute flex items-center justify-center bg-background border-[0.533vw] tablet:border-[0.25vw] desktop:border-[0.104vw] border-accent-cyan shadow-[0_0_20px_theme(colors.accent-cyan)] w-[18vw] h-[10vw] tablet:w-[8.5vw] tablet:h-[4.75vw] desktop:w-[4.167vw] desktop:h-[2.083vw] cursor-pointer z-10 rounded-[0.8vw] tablet:rounded-[0.375vw] desktop:rounded-[0.156vw]"
        style={{
          left: `${node.x}px`,
          top: `${node.y}px`,
          transform: "translate(-50%, -50%)",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.3, delay: animationDelay }}
        onMouseEnter={() => onHover(node.id)}
        onMouseLeave={onLeave}
        onClick={() => onHover(node.id)}
      >
        <span className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] font-mono font-bold text-accent-cyan tracking-wider">
          {"CPU"}
        </span>
      </motion.div>
    );
  }

  if (node.type === "category") {
    return (
      <motion.div
        className={`absolute flex items-center justify-center bg-bg-secondary border-[0.267vw] tablet:border-[0.125vw] desktop:border-[0.052vw] border-accent-purple cursor-pointer z-10 transition-opacity duration-300 rounded-[0.533vw] tablet:rounded-[0.25vw] desktop:rounded-[0.104vw] px-[2.667vw] py-[1.333vw] tablet:px-[1.25vw] tablet:py-[0.625vw] desktop:px-[0.521vw] desktop:py-[0.26vw] ${isDimmed ? "opacity-30" : "opacity-100"}`}
        style={{
          left: `${node.x}px`,
          top: `${node.y}px`,
          transform: "translate(-50%, -50%)",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.3, delay: animationDelay }}
        onMouseEnter={() => onHover(node.id)}
        onMouseLeave={onLeave}
        onClick={() => onHover(node.id)}
      >
        <span className="text-[2.4vw] tablet:text-[1.125vw] desktop:text-[0.469vw] font-mono text-accent-purple text-center leading-tight whitespace-nowrap">
          {node.label}
        </span>
      </motion.div>
    );
  }

  // Skill node — rectangular PCB pad
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
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.3, delay: animationDelay }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={onLeave}
      onClick={() => onHover(node.id)}
    >
      <div
        className={`flex items-center justify-center bg-bg-secondary ${styles.border} ${styles.borderStyle} ${styles.opacity} ${styles.glow} w-[9.333vw] h-[9.333vw] tablet:w-[4.375vw] tablet:h-[4.375vw] desktop:w-[1.823vw] desktop:h-[1.823vw] cursor-pointer transition-all duration-300 rounded-[1.067vw] tablet:rounded-[0.5vw] desktop:rounded-[0.208vw] ${isDimmed ? "!opacity-20" : ""} ${isHighlighted ? "!opacity-100 scale-110" : ""}`}
        style={
          {
            borderColor: nodeColor,
            "--node-color": nodeColor,
          } as React.CSSProperties
        }
      >
        {Icon && (
          <Icon
            className="w-[4vw] h-[4vw] tablet:w-[1.875vw] tablet:h-[1.875vw] desktop:w-[0.781vw] desktop:h-[0.781vw]"
            style={{ color: nodeColor }}
          />
        )}
      </div>
      <span
        className={`mt-[0.8vw] tablet:mt-[0.375vw] desktop:mt-[0.156vw] text-[2.4vw] tablet:text-[1.125vw] desktop:text-[0.469vw] font-mono text-text-muted whitespace-nowrap transition-opacity duration-300 ${isDimmed ? "opacity-20" : ""}`}
      >
        {node.label}
      </span>
    </motion.div>
  );
}

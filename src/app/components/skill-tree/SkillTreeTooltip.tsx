"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { LayoutNode } from "./tree-layout";
import type { SkillTier } from "@/app/models/common";
import type { IconType } from "react-icons";
import * as SiIcons from "react-icons/si";

const iconMap = SiIcons as unknown as Record<string, IconType>;

const tierLabels: Record<SkillTier, string> = {
  expert: "Mastered",
  proficient: "Proficient",
  familiar: "Familiar",
};

const tierColors: Record<SkillTier, string> = {
  expert: "text-accent-emerald",
  proficient: "text-accent-cyan",
  familiar: "text-text-muted",
};

interface SkillTreeTooltipProps {
  node: LayoutNode | null;
}

export default function SkillTreeTooltip({ node }: SkillTreeTooltipProps) {
  const Icon = node?.icon ? iconMap[node.icon] : null;
  const tier = node?.tier ?? "familiar";

  return (
    <AnimatePresence>
      {node && node.type === "skill" && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.15 }}
          className="absolute z-50 pointer-events-none bg-bg-secondary border border-border-subtle rounded-[1.333vw] tablet:rounded-[0.625vw] desktop:rounded-[0.26vw] px-[2.667vw] py-[1.6vw] tablet:px-[1.25vw] tablet:py-[0.75vw] desktop:px-[0.521vw] desktop:py-[0.313vw] shadow-lg"
          style={{
            left: `${node.x}px`,
            top: `${node.y + 30}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="flex items-center gap-[1.6vw] tablet:gap-[0.75vw] desktop:gap-[0.313vw]">
            {Icon && (
              <Icon
                className="w-[5.333vw] h-[5.333vw] tablet:w-[2.5vw] tablet:h-[2.5vw] desktop:w-[1.042vw] desktop:h-[1.042vw]"
                style={{ color: node.color }}
              />
            )}
            <div>
              <p className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] font-semibold text-foreground whitespace-nowrap">
                {node.label}
              </p>
              <p className={`text-[2.667vw] tablet:text-[1.25vw] desktop:text-[0.521vw] font-mono ${tierColors[tier]}`}>
                {tierLabels[tier]}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

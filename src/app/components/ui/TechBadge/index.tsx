"use client";

import { motion } from "framer-motion";
import { scaleUp } from "@/app/lib/animations";
import * as SiIcons from "react-icons/si";
import type { IconType } from "react-icons";

interface TechBadgeProps {
  name: string;
  icon: string;
  color: string;
}

const iconMap: Record<string, IconType> = SiIcons as unknown as Record<
  string,
  IconType
>;

export default function TechBadge({ name, icon, color }: TechBadgeProps) {
  const IconComponent = iconMap[icon];

  return (
    <motion.div
      variants={scaleUp}
      className="flex items-center gap-[2.133vw] tablet:gap-[1vw] desktop:gap-[0.417vw] rounded-[2.133vw] tablet:rounded-[1vw] desktop:rounded-[0.417vw] border border-border-subtle bg-bg-secondary px-[3.2vw] py-[2.133vw] tablet:px-[1.5vw] tablet:py-[1vw] desktop:px-[0.625vw] desktop:py-[0.417vw] transition-all duration-200 hover:-translate-y-[0.267vw] tablet:hover:-translate-y-[0.125vw] desktop:hover:-translate-y-[0.052vw] hover:border-accent-cyan/20"
    >
      {IconComponent && (
        <IconComponent
          className="w-[4.267vw] h-[4.267vw] tablet:w-[2vw] tablet:h-[2vw] desktop:w-[0.833vw] desktop:h-[0.833vw]"
          style={{ color }}
        />
      )}
      <span className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-foreground">{name}</span>
    </motion.div>
  );
}

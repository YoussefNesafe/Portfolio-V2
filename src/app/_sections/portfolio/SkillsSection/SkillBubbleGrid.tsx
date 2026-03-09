"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { defaultViewport } from "@/app/lib/animations";
import type { SkillCategory } from "@/app/models/common";
import * as SiIcons from "react-icons/si";
import type { IconType } from "react-icons";

const iconMap: Record<string, IconType> = SiIcons as unknown as Record<
  string,
  IconType
>;

const CATEGORY_COLORS: Record<string, string> = {
  Frontend: "#06B6D4",
  "State & Data": "#A855F7",
  "Styling & UI": "#10B981",
  Testing: "#EF4444",
  "DevOps & Tools": "#F59E0B",
};

const SIZE_CLASSES = [
  "w-[20vw] h-[20vw] tablet:w-[10vw] tablet:h-[10vw]",
  "w-[17vw] h-[17vw] tablet:w-[8.5vw] tablet:h-[8.5vw]",
  "w-[15vw] h-[15vw] tablet:w-[7.5vw] tablet:h-[7.5vw]",
];

interface Props {
  categories: SkillCategory[];
}

export default function SkillBubbleGrid({ categories }: Props) {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  const allSkills = categories.flatMap((cat, catIdx) =>
    cat.skills.map((skill, skillIdx) => ({
      ...skill,
      categoryName: cat.name,
      categoryColor: CATEGORY_COLORS[cat.name] ?? skill.color,
      sizeClass: SIZE_CLASSES[skillIdx % SIZE_CLASSES.length],
    }))
  );

  return (
    <div className="flex flex-col gap-[6.4vw] tablet:gap-[3vw]">
      {categories.map((cat, catIdx) => (
        <div key={cat.name}>
          <h4 className="font-mono text-accent-purple uppercase tracking-wider text-[3.2vw] tablet:text-[1.5vw] mb-[3.2vw] tablet:mb-[1.5vw]">
            {cat.name}
          </h4>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.06,
                  delayChildren: catIdx * 0.15,
                },
              },
            }}
            className="flex flex-wrap gap-[3.2vw] tablet:gap-[1.5vw] items-center justify-start"
          >
            {cat.skills.map((skill, skillIdx) => {
              const catColor = CATEGORY_COLORS[cat.name] ?? skill.color;
              const isActive = activeSkill === `${cat.name}-${skill.name}`;
              const sizeClass = SIZE_CLASSES[skillIdx % SIZE_CLASSES.length];
              const IconComponent = iconMap[skill.icon];

              return (
                <motion.button
                  key={skill.name}
                  variants={{
                    hidden: { opacity: 0, scale: 0 },
                    visible: {
                      opacity: 1,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      },
                    },
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setActiveSkill(
                      isActive ? null : `${cat.name}-${skill.name}`
                    )
                  }
                  className={`${sizeClass} rounded-full flex flex-col items-center justify-center gap-[1.5vw] tablet:gap-[0.6vw] transition-all duration-300 border-2 cursor-pointer`}
                  style={{
                    borderColor: isActive ? catColor : `${catColor}33`,
                    backgroundColor: isActive
                      ? `${catColor}20`
                      : `${catColor}0A`,
                    boxShadow: isActive
                      ? `0 0 20px ${catColor}40, inset 0 0 15px ${catColor}15`
                      : "none",
                  }}
                >
                  {IconComponent && (
                    <IconComponent
                      className="w-[5.333vw] h-[5.333vw] tablet:w-[2.5vw] tablet:h-[2.5vw]"
                      style={{ color: isActive ? catColor : `${catColor}99` }}
                    />
                  )}
                  <span
                    className="text-[2.667vw] tablet:text-[1.1vw] font-medium text-center leading-tight px-[1vw]"
                    style={{
                      color: isActive ? catColor : "rgba(255,255,255,0.7)",
                    }}
                  >
                    {skill.name}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { SkillCategory } from "@/app/models/common";
import * as SiIcons from "react-icons/si";
import type { IconType } from "react-icons";

const iconMap: Record<string, IconType> = SiIcons as unknown as Record<
  string,
  IconType
>;

const CATEGORY_ACCENTS: Record<string, { color: string; glow: string }> = {
  Frontend: { color: "#06B6D4", glow: "rgba(6,182,212,0.15)" },
  "State & Data": { color: "#A855F7", glow: "rgba(168,85,247,0.15)" },
  "Styling & UI": { color: "#10B981", glow: "rgba(16,185,129,0.15)" },
  Testing: { color: "#EF4444", glow: "rgba(239,68,68,0.15)" },
  "DevOps & Tools": { color: "#F59E0B", glow: "rgba(245,158,11,0.15)" },
};

function getAccent(name: string) {
  return CATEGORY_ACCENTS[name] ?? { color: "#06B6D4", glow: "rgba(6,182,212,0.15)" };
}

interface Props {
  categories: SkillCategory[];
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 200, damping: 24 },
  },
};

const skillVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export default function SkillCards({ categories }: Props) {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-[4.267vw] tablet:gap-[2vw] desktop:gap-[0.833vw]"
    >
      {categories.map((cat) => {
        const accent = getAccent(cat.name);

        return (
          <motion.div
            key={cat.name}
            variants={cardVariants}
            className="group relative rounded-[3.2vw] tablet:rounded-[1.5vw] desktop:rounded-[0.625vw] border border-white/8 bg-white/[0.03] backdrop-blur-[12px] overflow-hidden transition-colors duration-300 hover:border-white/15"
          >
            {/* Top accent line */}
            <div
              className="h-[0.8vw] tablet:h-[0.375vw] desktop:h-[0.156vw] w-full"
              style={{ background: `linear-gradient(90deg, ${accent.color}, transparent)` }}
            />

            {/* Card content */}
            <div className="p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw]">
              {/* Category header */}
              <div className="flex items-center gap-[2.667vw] tablet:gap-[1.25vw] desktop:gap-[0.521vw] mb-[4.267vw] tablet:mb-[2vw] desktop:mb-[0.833vw]">
                <span
                  className="inline-block w-[2.133vw] h-[2.133vw] tablet:w-[1vw] tablet:h-[1vw] desktop:w-[0.417vw] desktop:h-[0.417vw] rounded-full"
                  style={{ backgroundColor: accent.color, boxShadow: `0 0 8px ${accent.glow}` }}
                />
                <h4
                  className="font-mono text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] font-semibold tracking-wide uppercase"
                  style={{ color: accent.color }}
                >
                  {cat.name}
                </h4>
              </div>

              {/* Skills list */}
              <motion.div
                variants={containerVariants}
                className="flex flex-col gap-[2.133vw] tablet:gap-[1vw] desktop:gap-[0.417vw]"
              >
                {cat.skills.map((skill) => {
                  const Icon = iconMap[skill.icon];
                  const isHovered = hoveredSkill === `${cat.name}-${skill.name}`;

                  return (
                    <motion.div
                      key={skill.name}
                      variants={skillVariants}
                      onMouseEnter={() => setHoveredSkill(`${cat.name}-${skill.name}`)}
                      onMouseLeave={() => setHoveredSkill(null)}
                      className="flex items-center gap-[2.667vw] tablet:gap-[1.25vw] desktop:gap-[0.521vw] py-[1.6vw] px-[2.667vw] tablet:py-[0.75vw] tablet:px-[1.25vw] desktop:py-[0.313vw] desktop:px-[0.521vw] rounded-[1.6vw] tablet:rounded-[0.75vw] desktop:rounded-[0.313vw] transition-all duration-200 cursor-default"
                      style={{
                        backgroundColor: isHovered ? `${accent.color}10` : "transparent",
                      }}
                    >
                      {/* Icon */}
                      <div
                        className="flex items-center justify-center w-[6.4vw] h-[6.4vw] tablet:w-[3vw] tablet:h-[3vw] desktop:w-[1.25vw] desktop:h-[1.25vw] rounded-[1.333vw] tablet:rounded-[0.625vw] desktop:rounded-[0.26vw] shrink-0 transition-all duration-200"
                        style={{
                          backgroundColor: isHovered ? `${skill.color}20` : `${skill.color}0D`,
                          border: `1px solid ${isHovered ? `${skill.color}40` : `${skill.color}15`}`,
                        }}
                      >
                        {Icon && (
                          <Icon
                            className="w-[3.467vw] h-[3.467vw] tablet:w-[1.625vw] tablet:h-[1.625vw] desktop:w-[0.677vw] desktop:h-[0.677vw] transition-colors duration-200"
                            style={{ color: isHovered ? skill.color : `${skill.color}99` }}
                          />
                        )}
                      </div>

                      {/* Name */}
                      <span
                        className="text-[3.467vw] tablet:text-[1.625vw] desktop:text-[0.677vw] font-medium transition-colors duration-200"
                        style={{
                          color: isHovered ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.65)",
                        }}
                      >
                        {skill.name}
                      </span>

                      {/* Hover indicator dot */}
                      <motion.span
                        initial={false}
                        animate={{
                          opacity: isHovered ? 1 : 0,
                          scale: isHovered ? 1 : 0,
                        }}
                        transition={{ duration: 0.15 }}
                        className="ml-auto w-[1.333vw] h-[1.333vw] tablet:w-[0.625vw] tablet:h-[0.625vw] desktop:w-[0.26vw] desktop:h-[0.26vw] rounded-full shrink-0"
                        style={{ backgroundColor: skill.color }}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* Subtle corner glow on hover */}
            <div
              className="absolute top-0 right-0 w-[26.667vw] h-[26.667vw] tablet:w-[12.5vw] tablet:h-[12.5vw] desktop:w-[5.208vw] desktop:h-[5.208vw] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -translate-y-1/2 translate-x-1/2"
              style={{
                background: `radial-gradient(circle, ${accent.glow}, transparent 70%)`,
              }}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}

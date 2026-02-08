"use client";

import { motion } from "framer-motion";
import {
  fastStaggerContainer,
  fadeUp,
  defaultViewport,
} from "@/app/lib/animations";
import type { ISkillsSection } from "@/app/models/Skills";
import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";
import TechBadge from "@/app/components/ui/TechBadge";

export default function SkillsSection(props: ISkillsSection) {
  return (
    <Section id="skills">
      <SectionHeading label={props.sectionLabel} title={props.title} />

      <div className="flex flex-col gap-[8.533vw] tablet:gap-[4vw] desktop:gap-[1.667vw]">
        {props.categories.map((category) => (
          <motion.div
            key={category.name}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={fadeUp}
          >
            <h4 className="font-mono text-accent-purple uppercase tracking-wider text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] mb-[4.267vw] tablet:mb-[2vw] desktop:mb-[0.833vw]">
              {category.name}
            </h4>
            <motion.div
              variants={fastStaggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="flex flex-wrap gap-[2.667vw] tablet:gap-[1.25vw] desktop:gap-[0.521vw]"
            >
              {category.skills.map((skill) => (
                <TechBadge
                  key={skill.name}
                  name={skill.name}
                  icon={skill.icon}
                  color={skill.color}
                />
              ))}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

"use client";

import { motion } from "framer-motion";
import { fadeUp, defaultViewport } from "@/app/lib/animations";
import type { ISkillsSection } from "@/app/models/Skills";
import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";
import SkillCards from "./SkillCards";

export default function SkillsSection(props: ISkillsSection) {
  return (
    <Section id="skills">
      <SectionHeading label={props.sectionLabel} title={props.title} />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        variants={fadeUp}
      >
        <SkillCards categories={props.categories} />
      </motion.div>
    </Section>
  );
}

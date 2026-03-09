"use client";

import { motion } from "framer-motion";
import { fadeUp, defaultViewport } from "@/app/lib/animations";
import type { ISkillsSection } from "@/app/models/Skills";
import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import SkillConstellation from "./SkillConstellation";
import SkillBubbleGrid from "./SkillBubbleGrid";

export default function SkillsSection(props: ISkillsSection) {
  const isMobileOrTablet = useIsMobile(1023);

  return (
    <Section id="skills">
      <SectionHeading label={props.sectionLabel} title={props.title} />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        variants={fadeUp}
      >
        {isMobileOrTablet ? (
          <SkillBubbleGrid categories={props.categories} />
        ) : (
          <SkillConstellation categories={props.categories} />
        )}
      </motion.div>
    </Section>
  );
}

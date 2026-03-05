"use client";

import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";
import type { ISkillsSection } from "@/app/models/Skills";
import { SkillTree } from "@/app/components/skill-tree";

export default function SkillsSection({
  sectionLabel,
  title,
  categories,
}: ISkillsSection) {
  return (
    <Section id="skills">
      <SectionHeading label={sectionLabel} title={title} />
      <SkillTree categories={categories} />
    </Section>
  );
}

"use client";

import type { IProjectsSection } from "@/app/models/Projects";
import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";
import ProjectCard from "./ProjectCard";

export default function ProjectsSection(props: IProjectsSection) {
  return (
    <Section id="projects">
      <SectionHeading label={props.sectionLabel} title={props.title} />

      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-[5.333vw] tablet:gap-[2.5vw] desktop:gap-[1.042vw]">
        {props.items.map((item, index) => (
          <ProjectCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </Section>
  );
}

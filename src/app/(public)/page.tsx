import { getDictionary } from "@/get-dictionary";
import HeroSection from "@/app/_sections/portfolio/HeroSection";
import AboutSection from "@/app/_sections/portfolio/AboutSection";
import ExperienceSection from "@/app/_sections/portfolio/ExperienceSection";
import ProjectsSection from "@/app/_sections/portfolio/ProjectsSection";
import SkillsSection from "@/app/_sections/portfolio/SkillsSection";
import ContactSection from "@/app/_sections/portfolio/ContactSection";
import SectionDivider from "@/app/components/ui/SectionDivider";
import HomeContent from "./HomeContent";

export default async function Home() {
  const dict = await getDictionary();

  const designerContent = (
    <>
      <HeroSection {...dict.hero} />
      <SectionDivider />
      <AboutSection {...dict.about} />
      <SectionDivider />
      <ExperienceSection {...dict.experience} />
      <SectionDivider />
      <ProjectsSection {...dict.projects} />
      <SectionDivider />
      <SkillsSection {...dict.skills} />
      <SectionDivider />
      <ContactSection {...dict.contact} />
    </>
  );

  return (
    <HomeContent
      dict={{
        hero: dict.hero,
        about: dict.about,
        experience: dict.experience,
        projects: dict.projects,
        skills: dict.skills,
        contact: dict.contact,
      }}
      designerContent={designerContent}
    />
  );
}

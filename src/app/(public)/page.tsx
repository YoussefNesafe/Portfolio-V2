import { getDictionary } from "@/get-dictionary";
import HeroSection from "@/app/_sections/portfolio/HeroSection";
import AboutSection from "@/app/_sections/portfolio/AboutSection";
import ExperienceSection from "@/app/_sections/portfolio/ExperienceSection";
import ProjectsSection from "@/app/_sections/portfolio/ProjectsSection";
import SkillsSection from "@/app/_sections/portfolio/SkillsSection";
import ContactSection from "@/app/_sections/portfolio/ContactSection";

export default async function Home() {
  const dict = await getDictionary();

  return (
    <main>
      <HeroSection {...dict.hero} />
      <AboutSection {...dict.about} />
      <ExperienceSection {...dict.experience} />
      <ProjectsSection {...dict.projects} />
      <SkillsSection {...dict.skills} />
      <ContactSection {...dict.contact} />
    </main>
  );
}

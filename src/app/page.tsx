import { getDictionary } from "@/get-dictionary";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ScrollProgress from "./components/ui/ScrollProgress";
import HeroSection from "./_sections/portfolio/HeroSection";
import AboutSection from "./_sections/portfolio/AboutSection";
import ExperienceSection from "./_sections/portfolio/ExperienceSection";
import ProjectsSection from "./_sections/portfolio/ProjectsSection";
import SkillsSection from "./_sections/portfolio/SkillsSection";
import ContactSection from "./_sections/portfolio/ContactSection";

export default async function Home() {
  const dict = await getDictionary();

  return (
    <>
      <ScrollProgress />
      <Header {...dict.layout.header} />
      <main>
        <HeroSection {...dict.hero} />
        <AboutSection {...dict.about} />
        <ExperienceSection {...dict.experience} />
        <ProjectsSection {...dict.projects} />
        <SkillsSection {...dict.skills} />
        <ContactSection {...dict.contact} />
      </main>
      <Footer {...dict.layout.footer} />
    </>
  );
}

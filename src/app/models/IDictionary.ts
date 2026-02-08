import type { IHeroSection } from "./Hero";
import type { IAboutSection } from "./About";
import type { IExperienceSection } from "./Experience";
import type { IProjectsSection } from "./Projects";
import type { ISkillsSection } from "./Skills";
import type { IContactSection } from "./Contact";
import type { ILayout } from "./Layout";

export interface IDictionary {
  layout: ILayout;
  hero: IHeroSection;
  about: IAboutSection;
  experience: IExperienceSection;
  projects: IProjectsSection;
  skills: ISkillsSection;
  contact: IContactSection;
}

import type { IHeroSection } from "./Hero";
import type { IAboutSection } from "./About";
import type { IExperienceSection } from "./Experience";
import type { IProjectsSection } from "./Projects";
import type { ISkillsSection } from "./Skills";
import type { IContactSection } from "./Contact";
import type { ILayout } from "./Layout";
import type { IBlogDictionary, IBlogPostDictionary } from "./IBlogDictionary";
import type { IBragDictionary } from "./IBragDictionary";
import type { IAdminDictionary } from "./IAdminDictionary";
import type { IStoryDictionary } from "./IStoryDictionary";

export interface IDictionary {
  layout: ILayout;
  hero: IHeroSection;
  about: IAboutSection;
  experience: IExperienceSection;
  projects: IProjectsSection;
  skills: ISkillsSection;
  contact: IContactSection;
  blog: IBlogDictionary;
  blogPost: IBlogPostDictionary;
  brag: IBragDictionary;
  admin: IAdminDictionary;
  story: IStoryDictionary;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  type: string;
  href: string;
  icon: string;
}

export interface ContactItem {
  type: string;
  value: string;
  href: string;
  icon: string;
}

export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export interface Skill {
  name: string;
  icon: string;
  color: string;
}

export interface SkillCategory {
  name: string;
  skills: Skill[];
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
  achievements: string[];
  tech: string[];
}

export interface CTA {
  label: string;
  href: string;
}

export interface TerminalBlock {
  command: string;
  lines: string[];
}

export interface Language {
  language: string;
  level: string;
}

export interface Education {
  degree: string;
  university: string;
  location: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  type: string;
  description: string;
  image: string;
  url: string;
  highlights: string[];
  tech: string[];
}

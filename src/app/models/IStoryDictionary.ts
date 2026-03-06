export interface IStoryPanel {
  layout: "full" | "split" | "triple";
  background: "grid" | "dots" | "gradient" | "none";
  narration: string[];
  highlight?: string;
  visual: string;
  choice?: IStoryChoice;
}

export interface IStoryChoiceOption {
  label: string;
  personality: string;
  followUp: string[];
}

export interface IStoryChoice {
  question: string;
  options: IStoryChoiceOption[];
}

export interface IStoryPersonality {
  id: string;
  title: string;
  color: string;
  description: string;
}

export interface IStoryChapter {
  id: string;
  title: string;
  subtitle: string;
  color: "cyan" | "purple" | "emerald";
  panels: IStoryPanel[];
}

export interface IStoryNav {
  back: string;
  next: string;
  finish: string;
  skipNarration: string;
}

export interface IStoryDictionary {
  title: string;
  subtitle: string;
  chapters: IStoryChapter[];
  nav: IStoryNav;
  personalities: IStoryPersonality[];
  result: { title: string };
}

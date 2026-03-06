export interface IStoryPanel {
  layout: "full" | "split" | "triple";
  background: "grid" | "dots" | "gradient" | "none";
  narration: string[];
  highlight?: string;
  visual: string;
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
}

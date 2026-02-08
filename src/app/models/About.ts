import type { Stat, TerminalBlock } from "./common";

export interface IAboutSection {
  sectionLabel: string;
  title: string;
  terminal: TerminalBlock;
  stats: Stat[];
}

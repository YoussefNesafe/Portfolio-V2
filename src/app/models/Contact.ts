import type { ContactItem, TerminalBlock } from "./common";

export interface IContactSection {
  sectionLabel: string;
  title: string;
  description: string;
  items: ContactItem[];
  terminal: TerminalBlock;
  ctaLabel: string;
  ctaHref: string;
}

import type { NavItem, SocialLink } from "./common";

export interface IHeader {
  logo: string;
  nav: NavItem[];
}

export interface IFooter {
  credit: string;
  socials: SocialLink[];
}

export interface ILayout {
  header: IHeader;
  footer: IFooter;
}

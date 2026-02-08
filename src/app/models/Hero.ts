import type { CTA } from "./common";

export interface IHeroSection {
  greeting: string;
  name: string;
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix: string;
  tagline: string;
  ctaPrimary: CTA;
  ctaSecondary: CTA;
  scrollHint: string;
}

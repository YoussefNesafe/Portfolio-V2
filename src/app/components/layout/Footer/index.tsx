"use client";

import Link from "next/link";
import { FiLinkedin, FiMail } from "react-icons/fi";
import type { IFooter } from "@/app/models/Layout";
import type { IconType } from "react-icons";
import { useViewMode } from "@/app/components/view-mode/ViewModeContext";

const iconMap: Record<string, IconType> = {
  FiLinkedin,
  FiMail,
};

export default function Footer({ credit, socials }: IFooter) {
  const { mode } = useViewMode();
  const year = new Date().getFullYear();

  if (mode === "dev") return null;

  return (
    <footer className="border-t border-border-subtle">
      <div className="section-container !flex-row flex-wrap items-center justify-between py-[5.333vw] tablet:py-[2.5vw] desktop:py-[1.042vw] gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw]">
        <p className="text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-text-muted">
          {credit} &copy; {year}
        </p>
        <nav
          className="flex items-center gap-[3.2vw] tablet:gap-[1.5vw] desktop:gap-[0.625vw]"
          aria-label="Footer navigation"
        >
          {[
            { href: "/blog", label: "Blog" },
            { href: "/brag", label: "Work Log" },
            { href: "/story", label: "My Story" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[2.667vw] tablet:text-[1.25vw] desktop:text-[0.521vw] text-text-muted hover:text-accent-cyan transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-[3.2vw] tablet:gap-[1.5vw] desktop:gap-[0.625vw]">
          {socials.map((social) => {
            const Icon = iconMap[social.icon];
            const iconEl = Icon && (
              <Icon className="w-[4.267vw] h-[4.267vw] tablet:w-[2vw] tablet:h-[2vw] desktop:w-[0.833vw] desktop:h-[0.833vw]" />
            );
            const className = "text-text-muted hover:text-accent-cyan transition-colors";
            return social.href.startsWith("http") ? (
              <Link
                key={social.type}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
                aria-label={social.type}
              >
                {iconEl}
              </Link>
            ) : (
              <a
                key={social.type}
                href={social.href}
                className={className}
                aria-label={social.type}
              >
                {iconEl}
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}

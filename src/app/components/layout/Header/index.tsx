"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/app/utils/cn";
import { useScrollSpy } from "@/app/hooks/useScrollSpy";
import Image from "next/image";
import type { IHeader } from "@/app/models/Layout";

export default function Header({ logo, nav }: IHeader) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const anchorItems = nav.filter((item) => item.href.startsWith("#"));
  const sectionIds = anchorItems.map((item) => item.href.replace("#", ""));
  const activeId = useScrollSpy(sectionIds);

  function getHref(href: string) {
    // Anchor links need to be prefixed with / when not on homepage
    if (href.startsWith("#") && !isHome) return `/${href}`;
    return href;
  }

  function getIsActive(item: { href: string }) {
    const isPageLink = !item.href.startsWith("#");
    if (isPageLink) return pathname.startsWith(item.href);
    if (!isHome) return false;
    return activeId === item.href.replace("#", "");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-background/80 border-b border-border-subtle">
      <div className="section-container !flex-row items-center justify-between py-[3.2vw] tablet:py-[1.5vw] desktop:py-[0.625vw]">
        {/* Logo */}
        <Link
          href={isHome ? "#hero" : "/"}
          className="block w-[8vw] tablet:w-[4vw] desktop:w-[1.8vw]"
        >
          <Image
            src="/logo.svg"
            alt={logo}
            width={64}
            height={64}
            className="w-full h-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden tablet:flex items-center gap-[3.2vw] desktop:gap-[1.667vw]">
          {nav.map((item) => {
            const isActive = getIsActive(item);
            return (
              <Link
                key={item.href}
                href={getHref(item.href)}
                className={cn(
                  "relative text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] transition-colors duration-200",
                  isActive ? "text-accent-cyan" : "text-text-muted hover:text-foreground"
                )}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-[0.8vw] tablet:-bottom-[0.375vw] desktop:-bottom-[0.156vw] left-0 right-0 h-[0.533vw] tablet:h-[0.25vw] desktop:h-[0.104vw] bg-accent-cyan rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="tablet:hidden flex flex-col gap-[1.333vw] w-[5.333vw] cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <motion.span
            animate={mobileOpen ? { rotate: 45, y: "2.133vw" } : { rotate: 0, y: 0 }}
            className="block h-[0.533vw] w-full bg-foreground rounded-full origin-center"
          />
          <motion.span
            animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block h-[0.533vw] w-full bg-foreground rounded-full"
          />
          <motion.span
            animate={mobileOpen ? { rotate: -45, y: "-2.133vw" } : { rotate: 0, y: 0 }}
            className="block h-[0.533vw] w-full bg-foreground rounded-full origin-center"
          />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="tablet:hidden overflow-hidden bg-bg-secondary border-t border-border-subtle"
          >
            <div className="flex flex-col py-[2.667vw]">
              {nav.map((item) => {
                const isActive = getIsActive(item);
                return (
                  <Link
                    key={item.href}
                    href={getHref(item.href)}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "px-[4.267vw] py-[3.2vw] text-[4.267vw] tablet:text-[2vw] desktop:text-[0.833vw] transition-colors",
                      isActive
                        ? "text-accent-cyan bg-accent-cyan/5"
                        : "text-text-muted hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

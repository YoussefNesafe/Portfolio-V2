"use client";

import { useState, useEffect } from "react";

export function useScrollSpy(sectionIds: string[], offset = 100) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + offset;

      // If scrolled to the bottom of the page, activate the last section
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
      if (atBottom) {
        const lastId = sectionIds[sectionIds.length - 1];
        if (lastId && document.getElementById(lastId)) {
          setActiveId(lastId);
          return;
        }
      }

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i]);
        if (section && section.offsetTop <= scrollY) {
          setActiveId(sectionIds[i]);
          return;
        }
      }

      const firstExists = sectionIds[0] && document.getElementById(sectionIds[0]);
      setActiveId(firstExists ? sectionIds[0] : "");
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sectionIds, offset]);

  return activeId;
}

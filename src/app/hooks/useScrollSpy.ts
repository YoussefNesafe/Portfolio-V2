"use client";

import { useState, useEffect, useRef } from "react";

export function useScrollSpy(sectionIds: string[], offset = 100) {
  const [activeId, setActiveId] = useState<string>("");
  const idsRef = useRef(sectionIds);

  useEffect(() => {
    idsRef.current = sectionIds;
  }, [sectionIds]);

  useEffect(() => {
    const handleScroll = () => {
      const ids = idsRef.current;
      const scrollY = window.scrollY + offset;

      // If scrolled to the bottom of the page, activate the last section
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
      if (atBottom) {
        const lastId = ids[ids.length - 1];
        if (lastId && document.getElementById(lastId)) {
          setActiveId(lastId);
          return;
        }
      }

      for (let i = ids.length - 1; i >= 0; i--) {
        const section = document.getElementById(ids[i]);
        if (section && section.offsetTop <= scrollY) {
          setActiveId(ids[i]);
          return;
        }
      }

      const firstExists = ids[0] && document.getElementById(ids[0]);
      setActiveId(firstExists ? ids[0] : "");
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [offset]);

  return activeId;
}

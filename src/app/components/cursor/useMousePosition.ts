"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export const SECTION_COLORS: Record<string, string> = {
  hero: "#06B6D4",
  about: "#A855F7",
  experience: "#A855F7",
  projects: "#10B981",
  skills: "#06B6D4",
  contact: "#10B981",
};

export const DEFAULT_COLOR = "#06B6D4";

export function getSectionColor(sectionId: string | null): string {
  if (!sectionId) return DEFAULT_COLOR;
  return SECTION_COLORS[sectionId] ?? DEFAULT_COLOR;
}

interface MouseState {
  x: number;
  y: number;
  isVisible: boolean;
}

export function useMousePosition(): MouseState {
  const [isDesktop, setIsDesktop] = useState(false);
  const stateRef = useRef<MouseState>({
    x: 0,
    y: 0,
    isVisible: false,
  });
  const [state, setState] = useState<MouseState>(stateRef.current);
  const rafRef = useRef<number>(0);

  const updateState = useCallback(() => {
    setState({ ...stateRef.current });
    rafRef.current = 0;
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const handleMouseMove = (e: MouseEvent) => {
      stateRef.current.x = e.clientX;
      stateRef.current.y = e.clientY;
      stateRef.current.isVisible = true;

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(updateState);
      }
    };

    const handleMouseLeave = () => {
      stateRef.current.isVisible = false;
      setState({ ...stateRef.current });
    };

    const handleMouseEnter = () => {
      stateRef.current.isVisible = true;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isDesktop, updateState]);

  if (!isDesktop) {
    return { x: 0, y: 0, isVisible: false };
  }

  return state;
}

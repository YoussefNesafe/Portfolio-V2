"use client";

import { useEffect, useRef } from "react";
import { useMousePosition } from "./useMousePosition";
import { useViewMode } from "@/app/components/view-mode/ViewModeContext";

export default function CustomCursor() {
  const { x, y, color, isVisible } = useMousePosition();
  const { mode } = useViewMode();
  const dotRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  // Hide native cursor on mount (desktop only)
  useEffect(() => {
    if (mode === "dev") return;

    const mq = window.matchMedia("(min-width: 1024px)");
    if (!mq.matches) return;

    document.body.classList.add("cursor-none");
    return () => {
      document.body.classList.remove("cursor-none");
    };
  }, [mode]);

  // Update dot position via ref (no re-render needed for transform)
  useEffect(() => {
    if (dotRef.current) {
      dotRef.current.style.transform = `translate3d(${x - 4}px, ${y - 4}px, 0)`;
      dotRef.current.style.opacity = isVisible ? "1" : "0";
      dotRef.current.style.backgroundColor = color;
      dotRef.current.style.boxShadow = isVisible
        ? `0 0 12px ${color}, 0 0 4px ${color}`
        : "none";
    }
  }, [x, y, color, isVisible]);

  // Update spotlight via ref
  useEffect(() => {
    if (spotlightRef.current) {
      spotlightRef.current.style.background = isVisible
        ? `radial-gradient(circle 200px at ${x}px ${y}px, ${color}10 0%, transparent 100%)`
        : "none";
    }
  }, [x, y, color, isVisible]);

  if (mode === "dev") return null;

  return (
    <>
      {/* Spotlight — behind content */}
      <div
        ref={spotlightRef}
        className="fixed inset-0 z-[1] pointer-events-none hidden desktop:block"
        aria-hidden="true"
      />
      {/* Dot — above content */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-50 pointer-events-none hidden desktop:block w-[8px] h-[8px] rounded-full opacity-0 will-change-transform"
        style={{ transition: "transform 80ms ease-out, opacity 300ms ease, background-color 300ms ease, box-shadow 300ms ease" }}
        aria-hidden="true"
      />
    </>
  );
}

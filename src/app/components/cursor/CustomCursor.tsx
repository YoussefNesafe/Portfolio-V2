"use client";

import { useEffect, useRef } from "react";
import { useMousePosition } from "./useMousePosition";
import { useViewMode } from "@/app/components/view-mode/ViewModeContext";

const CURSOR_COLOR = "#06B6D4";

export default function CustomCursor() {
  const { x, y, isVisible } = useMousePosition();
  const { mode } = useViewMode();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dotRef.current) {
      dotRef.current.style.transform = `translate3d(${x - 3}px, ${y - 3}px, 0)`;
      dotRef.current.style.opacity = isVisible ? "1" : "0";
    }
  }, [x, y, isVisible]);

  useEffect(() => {
    if (ringRef.current) {
      ringRef.current.style.transform = `translate3d(${x - 16}px, ${y - 16}px, 0)`;
      ringRef.current.style.opacity = isVisible ? "1" : "0";
    }
  }, [x, y, isVisible]);

  if (mode === "dev") return null;

  return (
    <>
      {/* Center dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-50 pointer-events-none hidden desktop:block w-[6px] h-[6px] rounded-full opacity-0 will-change-transform"
        style={{
          backgroundColor: CURSOR_COLOR,
          transition: "opacity 300ms ease",
        }}
        aria-hidden="true"
      />
      {/* Outer ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-50 pointer-events-none hidden desktop:block w-[32px] h-[32px] rounded-full opacity-0 will-change-transform"
        style={{
          border: `1.5px solid ${CURSOR_COLOR}60`,
          transition: "transform 150ms ease-out, opacity 300ms ease",
        }}
        aria-hidden="true"
      />
    </>
  );
}

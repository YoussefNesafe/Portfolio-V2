"use client";

import { useEffect, useRef } from "react";
import { useMousePosition } from "./useMousePosition";
import { useViewMode } from "@/app/components/view-mode/ViewModeContext";

const CURSOR_COLOR = "#06B6D4";

export default function CustomCursor() {
  const { x, y, isVisible, variant } = useMousePosition();
  const { mode } = useViewMode();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const isPointer = variant === "pointer";

  useEffect(() => {
    if (dotRef.current) {
      const size = isPointer ? 4 : 6;
      const offset = size / 2;
      dotRef.current.style.transform = `translate3d(${x - offset}px, ${y - offset}px, 0) scale(${isPointer ? 0.5 : 1})`;
      dotRef.current.style.opacity = isVisible ? "1" : "0";
    }
  }, [x, y, isVisible, isPointer]);

  useEffect(() => {
    if (ringRef.current) {
      const size = isPointer ? 48 : 32;
      const offset = size / 2;
      ringRef.current.style.transform = `translate3d(${x - offset}px, ${y - offset}px, 0)`;
      ringRef.current.style.opacity = isVisible ? "1" : "0";
      ringRef.current.style.width = `${size}px`;
      ringRef.current.style.height = `${size}px`;
      ringRef.current.style.borderColor = isPointer
        ? `${CURSOR_COLOR}90`
        : `${CURSOR_COLOR}60`;
      ringRef.current.style.backgroundColor = isPointer
        ? `${CURSOR_COLOR}10`
        : "transparent";
    }
  }, [x, y, isVisible, isPointer]);

  if (mode === "dev") return null;

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-50 pointer-events-none hidden desktop:block w-[6px] h-[6px] rounded-full opacity-0 will-change-transform"
        style={{
          backgroundColor: CURSOR_COLOR,
          transition: "opacity 300ms ease, transform 100ms ease-out, width 200ms ease, height 200ms ease",
        }}
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-50 pointer-events-none hidden desktop:block rounded-full opacity-0 will-change-transform"
        style={{
          width: "32px",
          height: "32px",
          border: `1.5px solid ${CURSOR_COLOR}60`,
          transition: "transform 150ms ease-out, opacity 300ms ease, width 300ms cubic-bezier(0.33, 1, 0.68, 1), height 300ms cubic-bezier(0.33, 1, 0.68, 1), border-color 300ms ease, background-color 300ms ease",
        }}
        aria-hidden="true"
      />
    </>
  );
}

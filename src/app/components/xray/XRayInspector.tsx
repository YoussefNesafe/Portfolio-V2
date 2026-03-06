"use client";

import { useState, useEffect, useCallback } from "react";
import { useXRay } from "./XRayContext";
import XRayOverlay from "./XRayOverlay";
import XRayTooltip from "./XRayTooltip";
import { extractSpecs, type ElementSpecs } from "./hooks/useElementSpecs";

function findXRayTarget(el: HTMLElement | null): HTMLElement | null {
  let current = el;
  while (current) {
    if (current.hasAttribute("data-xray")) return current;
    current = current.parentElement;
  }
  return null;
}

export default function XRayInspector() {
  const { isActive } = useXRay();
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [specs, setSpecs] = useState<ElementSpecs | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isActive) return;
      setMouse({ x: e.clientX, y: e.clientY });

      const xrayTarget = findXRayTarget(e.target as HTMLElement);
      if (xrayTarget !== target) {
        setTarget(xrayTarget);
        setSpecs(extractSpecs(xrayTarget));
      }
    },
    [isActive, target]
  );

  const handleMouseLeave = useCallback(() => {
    setTarget(null);
    setSpecs(null);
  }, []);

  useEffect(() => {
    if (!isActive) {
      setTarget(null);
      setSpecs(null);
      return;
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isActive, handleMouseMove, handleMouseLeave]);

  if (!isActive || !target) return null;

  const rect = target.getBoundingClientRect();

  return (
    <>
      <XRayOverlay rect={rect} label={target.getAttribute("data-xray") ?? "Element"} />
      <XRayTooltip specs={specs} mouseX={mouse.x} mouseY={mouse.y} />
    </>
  );
}

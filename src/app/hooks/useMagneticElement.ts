"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

interface UseMagneticOptions {
  strength?: number;
  radius?: number;
}

interface MagneticTransform {
  x: number;
  y: number;
}

export function useMagneticElement({
  strength = 10,
  radius = 50,
}: UseMagneticOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [transform, setTransform] = useState<MagneticTransform>({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (prefersReducedMotion || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance < radius) {
        const pull = (1 - distance / radius) * strength;
        setTransform({
          x: (distX / distance) * pull || 0,
          y: (distY / distance) * pull || 0,
        });
      } else {
        setTransform({ x: 0, y: 0 });
      }
    },
    [prefersReducedMotion, strength, radius]
  );

  const handleMouseLeave = useCallback(() => {
    setTransform({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave, prefersReducedMotion]);

  return {
    ref,
    style: {
      transform: `translate(${transform.x}px, ${transform.y}px)`,
      transition: "transform 0.3s cubic-bezier(0.33, 1, 0.68, 1)",
    },
  };
}

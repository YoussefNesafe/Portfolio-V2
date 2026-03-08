"use client";

import { useRef, useCallback, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface UseTiltOptions {
  maxTilt?: number;
  perspective?: number;
  scale?: number;
}

export function useTilt({
  maxTilt = 8,
  perspective = 1000,
  scale = 1.02,
}: UseTiltOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [style, setStyle] = useState({
    transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`,
    transition: "transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)",
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (prefersReducedMotion || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      setStyle({
        transform: `perspective(${perspective}px) rotateX(${-y * maxTilt}deg) rotateY(${x * maxTilt}deg) scale(${scale})`,
        transition: "transform 0.1s ease-out",
      });
    },
    [prefersReducedMotion, maxTilt, perspective, scale]
  );

  const handleMouseLeave = useCallback(() => {
    setStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`,
      transition: "transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)",
    });
  }, [perspective]);

  return {
    ref,
    style: prefersReducedMotion ? {} : style,
    handlers: prefersReducedMotion
      ? {}
      : {
          onMouseMove: handleMouseMove,
          onMouseLeave: handleMouseLeave,
        },
  };
}

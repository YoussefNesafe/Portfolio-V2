"use client";

import { useState, useEffect, useCallback, type RefObject } from "react";
import type { SkillCategory } from "@/app/models/common";
import {
  computeRadialLayout,
  computeVerticalLayout,
  type TreeLayout,
} from "../tree-layout";

const MOBILE_BREAKPOINT = 481;

const EMPTY_LAYOUT: TreeLayout = { nodes: [], connections: [] };

export function useSkillTreeLayout(
  containerRef: RefObject<HTMLDivElement | null>,
  categories: SkillCategory[]
): TreeLayout {
  const [layout, setLayout] = useState<TreeLayout>(EMPTY_LAYOUT);

  const computeLayout = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    if (width === 0) return;

    const isMobile = width < MOBILE_BREAKPOINT;
    const result = isMobile
      ? computeVerticalLayout(categories, width)
      : computeRadialLayout(categories, width, height);

    setLayout(result);
  }, [containerRef, categories]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    computeLayout();

    const observer = new ResizeObserver(() => {
      computeLayout();
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [containerRef, computeLayout]);

  return layout;
}

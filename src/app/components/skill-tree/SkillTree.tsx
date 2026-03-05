"use client";

import { useRef, useState, useMemo, useCallback } from "react";
import type { SkillCategory } from "@/app/models/common";
import { useSkillTreeLayout } from "./hooks/useSkillTreeLayout";
import SkillTreeConnections from "./SkillTreeConnections";
import SkillTreeNode from "./SkillTreeNode";
import SkillTreeTooltip from "./SkillTreeTooltip";
import type { LayoutNode } from "./tree-layout";

interface SkillTreeProps {
  categories: SkillCategory[];
}

export default function SkillTree({ categories }: SkillTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const layout = useSkillTreeLayout(containerRef, categories);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const handleHover = useCallback(
    (nodeId: string) => {
      setHoveredNodeId((prev) => (prev === nodeId ? null : nodeId));
    },
    []
  );

  const handleLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  const hoveredNode = useMemo(
    () => layout.nodes.find((n) => n.id === hoveredNodeId) ?? null,
    [layout.nodes, hoveredNodeId]
  );

  const highlightedConnectionIds = useMemo(() => {
    const ids = new Set<string>();
    if (!hoveredNodeId) return ids;

    const node = layout.nodes.find((n) => n.id === hoveredNodeId);
    if (!node) return ids;

    if (node.type === "core") {
      layout.connections.forEach((c) => ids.add(c.id));
    } else if (node.type === "category") {
      layout.connections.forEach((c) => {
        if (c.fromId === node.id || c.toId === node.id) ids.add(c.id);
      });
    } else if (node.type === "skill") {
      layout.connections.forEach((c) => {
        if (c.toId === node.id) ids.add(c.id);
      });
    }

    return ids;
  }, [hoveredNodeId, layout]);

  const isDimmed = useCallback(
    (node: LayoutNode) => {
      if (!hoveredNodeId) return false;
      const hovered = layout.nodes.find((n) => n.id === hoveredNodeId);
      if (!hovered || hovered.type !== "category") return false;
      if (node.type === "core") return false;
      if (node.id === hoveredNodeId) return false;
      if (node.categoryIndex === hovered.categoryIndex) return false;
      return true;
    },
    [hoveredNodeId, layout.nodes]
  );

  const isHighlighted = useCallback(
    (node: LayoutNode) => {
      if (!hoveredNodeId) return false;
      if (node.id === hoveredNodeId) return true;
      const hovered = layout.nodes.find((n) => n.id === hoveredNodeId);
      if (!hovered) return false;
      if (
        hovered.type === "category" &&
        node.categoryIndex === hovered.categoryIndex
      )
        return true;
      return false;
    },
    [hoveredNodeId, layout.nodes]
  );

  const getAnimationDelay = useCallback((node: LayoutNode) => {
    if (node.type === "core") return 0;
    if (node.type === "category") return 0.3 + (node.categoryIndex ?? 0) * 0.05;
    return 0.6 + (node.categoryIndex ?? 0) * 0.05;
  }, []);

  const containerHeight = layout.totalHeight
    ? `${layout.totalHeight}px`
    : "clamp(550px, 64vw, 980px)";

  return (
    <div
      ref={containerRef}
      className="relative w-full mt-[2.667vw] tablet:mt-[1.25vw] desktop:mt-[0.521vw] pb-[5.333vw] tablet:pb-[2.5vw] desktop:pb-[1.042vw]"
      style={{ height: containerHeight }}
    >
      {layout.nodes.length > 0 && (
        <>
          <SkillTreeConnections
            connections={layout.connections}
            highlightedIds={highlightedConnectionIds}
            width={containerRef.current?.clientWidth ?? 0}
            height={containerRef.current?.clientHeight ?? 0}
            animationDelay={0.3}
          />
          {layout.nodes.map((node) => (
            <SkillTreeNode
              key={node.id}
              node={node}
              isHighlighted={isHighlighted(node)}
              isDimmed={isDimmed(node)}
              onHover={handleHover}
              onLeave={handleLeave}
              animationDelay={getAnimationDelay(node)}
            />
          ))}
          <SkillTreeTooltip node={hoveredNode} />
        </>
      )}
    </div>
  );
}

"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { SkillCategory, Skill } from "@/app/models/common";

interface SkillNode {
  id: string;
  name: string;
  icon: string;
  color: string;
  categoryIndex: number;
  categoryName: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  radius: number;
  settled: boolean;
}

interface Props {
  categories: SkillCategory[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Frontend: "#06B6D4",
  "State & Data": "#A855F7",
  "Styling & UI": "#10B981",
  Testing: "#EF4444",
  "DevOps & Tools": "#F59E0B",
};

function getCategoryColor(name: string, fallbackColor: string): string {
  return CATEGORY_COLORS[name] ?? fallbackColor;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace("#", "");
  return {
    r: parseInt(cleaned.substring(0, 2), 16),
    g: parseInt(cleaned.substring(2, 4), 16),
    b: parseInt(cleaned.substring(4, 6), 16),
  };
}

export default function SkillConstellation({ categories }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<SkillNode[]>([]);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const hoveredRef = useRef<SkillNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const hasEnteredRef = useRef(false);

  const [tooltip, setTooltip] = useState<{
    name: string;
    color: string;
    x: number;
    y: number;
  } | null>(null);

  const buildNodes = useCallback(
    (width: number, height: number): SkillNode[] => {
      const nodes: SkillNode[] = [];
      const categoryCount = categories.length;
      const centerX = width / 2;
      const centerY = height / 2;
      const clusterRadius = Math.min(width, height) * 0.3;

      categories.forEach((cat, catIdx) => {
        const angle =
          (catIdx / categoryCount) * Math.PI * 2 - Math.PI / 2;
        const clusterCX = centerX + Math.cos(angle) * clusterRadius;
        const clusterCY = centerY + Math.sin(angle) * clusterRadius;

        cat.skills.forEach((skill: Skill, skillIdx: number) => {
          const skillAngle =
            (skillIdx / cat.skills.length) * Math.PI * 2;
          const skillRadius = 30 + Math.random() * 40;
          const targetX =
            clusterCX + Math.cos(skillAngle) * skillRadius;
          const targetY =
            clusterCY + Math.sin(skillAngle) * skillRadius;

          nodes.push({
            id: `${cat.name}-${skill.name}`,
            name: skill.name,
            icon: skill.icon,
            color: skill.color,
            categoryIndex: catIdx,
            categoryName: cat.name,
            x: Math.random() * width,
            y: Math.random() * height,
            vx: 0,
            vy: 0,
            targetX,
            targetY,
            radius: 6 + Math.random() * 4,
            settled: false,
          });
        });
      });

      return nodes;
    },
    [categories]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (nodesRef.current.length === 0) {
        nodesRef.current = buildNodes(rect.width, rect.height);
      } else {
        const oldNodes = nodesRef.current;
        const newTargets = buildNodes(rect.width, rect.height);
        oldNodes.forEach((node, i) => {
          if (newTargets[i]) {
            node.targetX = newTargets[i].targetX;
            node.targetY = newTargets[i].targetY;
          }
        });
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
      hoveredRef.current = null;
      setTooltip(null);
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    // Intersection observer for entry animation
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasEnteredRef.current) {
          hasEnteredRef.current = true;
          startTimeRef.current = performance.now();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(container);

    const SPRING = 0.02;
    const DAMPING = 0.9;
    const REPULSION_RADIUS = 100;
    const REPULSION_FORCE = 5;
    const FLOAT_AMP = 1.5;

    function animate(time: number) {
      if (!ctx || !canvas) return;
      const rect = container!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      if (document.hidden) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const nodes = nodesRef.current;
      const mouse = mouseRef.current;
      const elapsed = hasEnteredRef.current
        ? (time - startTimeRef.current) / 1000
        : 0;
      const entryProgress = Math.min(elapsed / 1.5, 1);
      const entryEase =
        1 - Math.pow(1 - entryProgress, 3); // cubic ease out

      let newHovered: SkillNode | null = null;

      // Update physics
      for (const node of nodes) {
        // Float offset
        const floatX =
          Math.sin(time * 0.001 + node.targetX * 0.01) * FLOAT_AMP;
        const floatY =
          Math.cos(time * 0.0012 + node.targetY * 0.01) * FLOAT_AMP;

        const tx = node.targetX + floatX;
        const ty = node.targetY + floatY;

        // Spring force toward target
        const dx = tx - node.x;
        const dy = ty - node.y;
        node.vx += dx * SPRING * entryEase;
        node.vy += dy * SPRING * entryEase;

        // Cursor repulsion
        const mdx = node.x - mouse.x;
        const mdy = node.y - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < REPULSION_RADIUS && mDist > 0) {
          const force =
            (1 - mDist / REPULSION_RADIUS) * REPULSION_FORCE;
          node.vx += (mdx / mDist) * force;
          node.vy += (mdy / mDist) * force;
        }

        // Check hover
        if (mDist < node.radius + 8) {
          newHovered = node;
        }

        // Apply damping and update position
        node.vx *= DAMPING;
        node.vy *= DAMPING;
        node.x += node.vx;
        node.y += node.vy;

        // Clamp to canvas
        node.x = Math.max(node.radius, Math.min(w - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(h - node.radius, node.y));

        node.settled =
          Math.abs(node.vx) < 0.01 && Math.abs(node.vy) < 0.01;
      }

      // Update tooltip
      if (newHovered !== hoveredRef.current) {
        hoveredRef.current = newHovered;
        if (newHovered) {
          setTooltip({
            name: newHovered.name,
            color: newHovered.color,
            x: newHovered.x,
            y: newHovered.y,
          });
        } else {
          setTooltip(null);
        }
      } else if (newHovered) {
        setTooltip({
          name: newHovered.name,
          color: newHovered.color,
          x: newHovered.x,
          y: newHovered.y,
        });
      }

      // Draw connections within same category
      const categoryGroups = new Map<number, SkillNode[]>();
      for (const node of nodes) {
        const group = categoryGroups.get(node.categoryIndex) ?? [];
        group.push(node);
        categoryGroups.set(node.categoryIndex, group);
      }

      for (const [, group] of categoryGroups) {
        const catColor = getCategoryColor(
          group[0].categoryName,
          group[0].color
        );
        const rgb = hexToRgb(catColor);

        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const a = group[i];
            const b = group[j];
            const dist = Math.sqrt(
              (a.x - b.x) ** 2 + (a.y - b.y) ** 2
            );
            const maxDist = 120;
            if (dist < maxDist) {
              const isHoveredLine =
                hoveredRef.current &&
                (hoveredRef.current.id === a.id ||
                  hoveredRef.current.id === b.id);
              const alpha = isHoveredLine
                ? 0.6
                : (1 - dist / maxDist) * 0.2;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * entryEase})`;
              ctx.lineWidth = isHoveredLine ? 1.5 : 0.8;
              ctx.stroke();
            }
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const isHovered = hoveredRef.current?.id === node.id;
        const nodeAlpha = entryEase;
        const catColor = getCategoryColor(node.categoryName, node.color);
        const rgb = hexToRgb(catColor);

        // Glow
        const glowRadius = isHovered ? node.radius * 4 : node.radius * 2.5;
        const gradient = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          glowRadius
        );
        gradient.addColorStop(
          0,
          `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(isHovered ? 0.4 : 0.15) * nodeAlpha})`
        );
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core circle
        ctx.beginPath();
        ctx.arc(
          node.x,
          node.y,
          isHovered ? node.radius * 1.3 : node.radius,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(isHovered ? 1 : 0.8) * nodeAlpha})`;
        ctx.fill();

        // White inner dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * nodeAlpha})`;
        ctx.fill();
      }

      // Draw category labels after nodes have settled
      if (entryProgress > 0.7) {
        const labelAlpha = Math.min((entryProgress - 0.7) / 0.3, 1);
        for (const [, group] of categoryGroups) {
          const catColor = getCategoryColor(
            group[0].categoryName,
            group[0].color
          );
          let avgX = 0;
          let avgY = 0;
          for (const n of group) {
            avgX += n.x;
            avgY += n.y;
          }
          avgX /= group.length;
          avgY /= group.length;

          // Find topmost node to place label above the cluster
          let minY = Infinity;
          for (const n of group) {
            if (n.y < minY) minY = n.y;
          }

          ctx.font = "600 11px ui-monospace, monospace";
          ctx.textAlign = "center";
          ctx.fillStyle = catColor.replace(
            ")",
            `, ${labelAlpha * 0.8})`
          );
          // Handle hex colors
          const rgb = hexToRgb(catColor);
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${labelAlpha * 0.8})`;
          ctx.fillText(
            group[0].categoryName.toUpperCase(),
            avgX,
            minY - 20
          );
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    }

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      observer.disconnect();
    };
  }, [buildNodes]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: "min(60vh, 600px)" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
      />
      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 flex items-center gap-[0.4vw] rounded-[0.3vw] border border-border-subtle bg-bg-secondary/90 backdrop-blur-sm px-[0.8vw] py-[0.35vw] shadow-lg"
          style={{
            left: tooltip.x,
            top: tooltip.y - 36,
            transform: "translateX(-50%)",
          }}
        >
          <span
            className="inline-block w-[0.5vw] h-[0.5vw] rounded-full"
            style={{ backgroundColor: tooltip.color }}
          />
          <span className="text-[0.7vw] font-medium text-foreground whitespace-nowrap">
            {tooltip.name}
          </span>
        </div>
      )}
    </div>
  );
}

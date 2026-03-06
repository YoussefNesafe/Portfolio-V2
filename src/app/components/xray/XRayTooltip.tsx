"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ElementSpecs } from "./hooks/useElementSpecs";

interface XRayTooltipProps {
  specs: ElementSpecs | null;
  mouseX: number;
  mouseY: number;
}

function ColorSwatch({ color }: { color: string }) {
  if (!color || color === "transparent" || color === "none") return null;
  return (
    <span
      className="inline-block w-[2.667vw] h-[2.667vw] tablet:w-[1.25vw] tablet:h-[1.25vw] desktop:w-[0.521vw] desktop:h-[0.521vw] rounded-[0.267vw] tablet:rounded-[0.125vw] desktop:rounded-[0.052vw] border border-border-subtle align-middle ml-[1.067vw] tablet:ml-[0.5vw] desktop:ml-[0.208vw]"
      style={{ backgroundColor: color }}
    />
  );
}

function SpecRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between gap-[2.667vw] tablet:gap-[1.25vw] desktop:gap-[0.521vw]">
      <span className="text-text-muted">{label}</span>
      <span className="text-foreground">
        {value}
        {color && <ColorSwatch color={color} />}
      </span>
    </div>
  );
}

function SpecGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-[2.133vw] tablet:mb-[1vw] desktop:mb-[0.417vw] last:mb-0">
      <div className="text-accent-cyan font-semibold mb-[1.067vw] tablet:mb-[0.5vw] desktop:mb-[0.208vw] text-[2.667vw] tablet:text-[1.25vw] desktop:text-[0.521vw]">
        {title}
      </div>
      <div className="flex flex-col gap-[0.533vw] tablet:gap-[0.25vw] desktop:gap-[0.104vw] text-[2.4vw] tablet:text-[1.125vw] desktop:text-[0.469vw]">
        {children}
      </div>
    </div>
  );
}

export default function XRayTooltip({ specs, mouseX, mouseY }: XRayTooltipProps) {
  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1440;
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 900;
  const tooltipW = 300;
  const tooltipH = 350;
  const offset = 16;

  const left = mouseX + tooltipW + offset > viewportW
    ? mouseX - tooltipW - offset
    : mouseX + offset;
  const top = mouseY + tooltipH + offset > viewportH
    ? Math.max(8, mouseY - tooltipH)
    : mouseY + offset;

  return (
    <AnimatePresence>
      {specs && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.12 }}
          className="fixed z-[60] pointer-events-none bg-bg-secondary/95 backdrop-blur-lg border border-border-subtle rounded-[1.6vw] tablet:rounded-[0.75vw] desktop:rounded-[0.313vw] px-[3.2vw] py-[2.667vw] tablet:px-[1.5vw] tablet:py-[1.25vw] desktop:px-[0.625vw] desktop:py-[0.521vw] font-mono shadow-xl max-w-[80vw] tablet:max-w-[40vw] desktop:max-w-[15.625vw]"
          style={{ left, top }}
        >
          <SpecGroup title="Layout">
            <SpecRow label="size" value={`${specs.layout.width} × ${specs.layout.height}`} />
            <SpecRow label="padding" value={specs.layout.padding} />
            <SpecRow label="margin" value={specs.layout.margin} />
            <SpecRow label="display" value={specs.layout.display} />
            {specs.layout.gap !== "0" && (
              <SpecRow label="gap" value={specs.layout.gap} />
            )}
          </SpecGroup>

          {specs.typography && (
            <SpecGroup title="Typography">
              <SpecRow label="font" value={specs.typography.fontFamily} />
              <SpecRow label="size" value={specs.typography.fontSize} />
              <SpecRow label="weight" value={specs.typography.fontWeight} />
              <SpecRow label="line-height" value={specs.typography.lineHeight} />
              <SpecRow label="color" value={specs.typography.color} color={specs.typography.color} />
            </SpecGroup>
          )}

          <SpecGroup title="Visual">
            <SpecRow label="background" value={specs.visual.background} color={specs.visual.background} />
            <SpecRow label="border" value={specs.visual.border} />
            {specs.visual.borderRadius !== "0" && (
              <SpecRow label="radius" value={specs.visual.borderRadius} />
            )}
            {specs.visual.boxShadow !== "none" && (
              <SpecRow label="shadow" value="present" />
            )}
          </SpecGroup>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

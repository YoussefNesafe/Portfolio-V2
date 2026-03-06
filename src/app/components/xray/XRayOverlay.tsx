"use client";

interface XRayOverlayProps {
  rect: DOMRect;
  label: string;
}

export default function XRayOverlay({ rect, label }: XRayOverlayProps) {
  return (
    <div
      className="fixed pointer-events-none z-50 border border-dashed border-accent-cyan/60"
      style={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      }}
    >
      <span className="absolute -top-[5.333vw] tablet:-top-[2.5vw] desktop:-top-[1.042vw] left-0 bg-accent-cyan/90 text-background text-[2.667vw] tablet:text-[1.25vw] desktop:text-[0.521vw] font-mono px-[1.6vw] tablet:px-[0.75vw] desktop:px-[0.313vw] py-[0.533vw] tablet:py-[0.25vw] desktop:py-[0.104vw] rounded-[0.533vw] tablet:rounded-[0.25vw] desktop:rounded-[0.104vw] whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

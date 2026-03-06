// src/app/components/xray/hooks/useElementSpecs.ts

export interface ElementSpecs {
  label: string;
  layout: {
    width: string;
    height: string;
    padding: string;
    margin: string;
    display: string;
    gap: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
    color: string;
  } | null;
  visual: {
    background: string;
    border: string;
    borderRadius: string;
    boxShadow: string;
  };
}

export function rgbToHex(color: string): string {
  if (!color) return "";
  if (color.startsWith("#")) return color;

  const match = color.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
  );
  if (!match) return color;

  const [, r, g, b, a] = match;
  if (a !== undefined && parseFloat(a) === 0) return "transparent";

  return (
    "#" +
    [r, g, b]
      .map((v) => parseInt(v).toString(16).padStart(2, "0").toUpperCase())
      .join("")
  );
}

export function formatSpacing(
  top: string,
  right: string,
  bottom: string,
  left: string
): string {
  const t = top || "0px";
  const r = right || "0px";
  const b = bottom || "0px";
  const l = left || "0px";

  if (t === "0px" && r === "0px" && b === "0px" && l === "0px") return "0";
  if (t === r && r === b && b === l) return t;
  if (t === b && r === l) return `${t} ${r}`;
  return `${t} ${r} ${b} ${l}`;
}

function hasTextContent(el: HTMLElement): boolean {
  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
      return true;
    }
  }
  return false;
}

export function extractSpecs(el: HTMLElement | null): ElementSpecs | null {
  if (!el) return null;

  const label = el.getAttribute("data-xray") ?? "Element";
  const s = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();

  const layout = {
    width: `${Math.round(rect.width)}px`,
    height: `${Math.round(rect.height)}px`,
    padding: formatSpacing(
      s.paddingTop,
      s.paddingRight,
      s.paddingBottom,
      s.paddingLeft
    ),
    margin: formatSpacing(
      s.marginTop,
      s.marginRight,
      s.marginBottom,
      s.marginLeft
    ),
    display: s.display,
    gap: s.gap === "normal" ? "0" : s.gap,
  };

  const typography = hasTextContent(el)
    ? {
        fontFamily: s.fontFamily.split(",")[0].replace(/['"]/g, "").trim(),
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        lineHeight: s.lineHeight,
        color: rgbToHex(s.color),
      }
    : null;

  const visual = {
    background: rgbToHex(s.backgroundColor),
    border:
      s.borderWidth === "0px"
        ? "none"
        : `${s.borderWidth} ${s.borderStyle} ${rgbToHex(s.borderColor)}`,
    borderRadius: s.borderRadius === "0px" ? "0" : s.borderRadius,
    boxShadow: s.boxShadow === "none" ? "none" : s.boxShadow,
  };

  return { label, layout, typography, visual };
}

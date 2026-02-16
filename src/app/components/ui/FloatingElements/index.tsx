import { SECTIONS } from "./sections";

interface SectionDecorationsProps {
  variant: keyof typeof SECTIONS;
}

export default function SectionDecorations({
  variant,
}: SectionDecorationsProps) {
  const items = SECTIONS[variant];
  if (!items) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {items.map((el, i) => (
        <div
          key={i}
          className={`absolute ${el.position} ${el.size} ${el.color} ${el.opacity} ${el.animation} ${el.rotate ?? ""} ${el.desktopOnly ? "hidden tablet:block" : ""}`}
          style={{ animationDelay: el.delay }}
        >
          {el.svg}
        </div>
      ))}
    </div>
  );
}

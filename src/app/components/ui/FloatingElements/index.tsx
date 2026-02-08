/* ── Inline SVG shapes ── */

const AngleBrackets = () => (
  <svg viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 10L6 20L16 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M34 10L44 20L34 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M28 6L22 34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CurlyBraces = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 6C10 6 8 8 8 12V16C8 18 6 20 6 20C6 20 8 22 8 24V28C8 32 10 34 14 34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M26 6C30 6 32 8 32 12V16C32 18 34 20 34 20C34 20 32 22 32 24V28C32 32 30 34 26 34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ArrowFunction = () => (
  <svg viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 15H30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M26 8L34 15L26 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="42" cy="15" r="3" fill="currentColor" />
  </svg>
);

const TerminalPrompt = () => (
  <svg viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 8L16 15L6 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 22H44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CodeComment = () => (
  <svg viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 8L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 15L32 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <path d="M8 22L24 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
  </svg>
);

const HashSymbol = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 8L10 32M26 8L22 32M8 16H34M6 26H32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const Binary = () => (
  <svg viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="4" y="18" fill="currentColor" fontSize="14" fontFamily="monospace">01</text>
    <text x="30" y="34" fill="currentColor" fontSize="14" fontFamily="monospace" opacity="0.6">10</text>
  </svg>
);

const AtSymbol = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M27 20C27 24 28 27 31 27C35 27 36 23 36 20C36 11.16 28.84 4 20 4C11.16 4 4 11.16 4 20C4 28.84 11.16 36 20 36C24 36 27.5 34.5 30 32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const Candlestick = () => (
  <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="12" y1="6" x2="12" y2="44" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    <rect x="8" y="14" width="8" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
    <line x1="28" y1="10" x2="28" y2="40" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    <rect x="24" y="20" width="8" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <line x1="44" y1="4" x2="44" y2="38" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    <rect x="40" y="8" width="8" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
  </svg>
);

const BarChart = () => (
  <svg viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="24" width="8" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
    <rect x="18" y="14" width="8" height="22" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
    <rect x="30" y="8" width="8" height="28" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
    <rect x="42" y="18" width="8" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
  </svg>
);

const TrendingLine = () => (
  <svg viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 32L16 22L26 28L46 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M36 8H46V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PulseWave = () => (
  <svg viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 15H14L18 4L24 26L30 10L34 15H56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GitBranch = () => (
  <svg viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="20" cy="42" r="4" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="34" cy="24" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M20 12V38" stroke="currentColor" strokeWidth="1.5" />
    <path d="M20 18C20 18 20 24 34 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const DollarSign = () => (
  <svg viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 4V36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M22 12C22 8 19 6 15 6C11 6 8 8 8 12C8 16 11 18 15 20C19 22 22 24 22 28C22 32 19 34 15 34C11 34 8 32 8 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ComponentTag = () => (
  <svg viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 10L4 20L14 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M36 10L46 20L36 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CircuitNode = () => (
  <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="25" cy="25" r="5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="25" cy="25" r="2" fill="currentColor" />
    <path d="M25 4V20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <path d="M25 30V46" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <path d="M4 25H20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <path d="M30 25H46" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

/* ── Section decoration configs ── */

const SIZE_SM = "w-[7vw] h-[7vw] tablet:w-[3.5vw] tablet:h-[3.5vw] desktop:w-[1.823vw] desktop:h-[1.823vw]";
const SIZE_MD = "w-[9vw] h-[9vw] tablet:w-[4.5vw] tablet:h-[4.5vw] desktop:w-[2.344vw] desktop:h-[2.344vw]";
const SIZE_LG = "w-[11vw] h-[11vw] tablet:w-[5.5vw] tablet:h-[5.5vw] desktop:w-[2.865vw] desktop:h-[2.865vw]";

interface FloatItem {
  svg: React.ReactNode;
  position: string;
  size: string;
  color: string;
  opacity: string;
  animation: string;
  delay: string;
  rotate?: string;
  desktopOnly?: boolean;
}

const SECTIONS: Record<string, FloatItem[]> = {
  hero: [
    { svg: <AngleBrackets />, position: "top-[12%] left-[8%]", size: SIZE_MD, color: "text-accent-cyan", opacity: "opacity-[0.06]", animation: "animate-float", delay: "0s" },
    { svg: <Candlestick />, position: "top-[18%] right-[6%]", size: SIZE_LG, color: "text-accent-emerald", opacity: "opacity-[0.05]", animation: "animate-float-slow", delay: "1s", desktopOnly: true },
    { svg: <TerminalPrompt />, position: "bottom-[18%] left-[10%]", size: SIZE_MD, color: "text-accent-purple", opacity: "opacity-[0.05]", animation: "animate-float-slower", delay: "2s", desktopOnly: true },
  ],
  about: [
    { svg: <CurlyBraces />, position: "top-[5%] right-[3%]", size: SIZE_MD, color: "text-accent-cyan", opacity: "opacity-[0.06]", animation: "animate-float", delay: "0s" },
    { svg: <BarChart />, position: "bottom-[8%] left-[2%]", size: SIZE_LG, color: "text-accent-emerald", opacity: "opacity-[0.05]", animation: "animate-float-slow", delay: "1.5s", desktopOnly: true },
    { svg: <ArrowFunction />, position: "top-[40%] right-[2%]", size: SIZE_SM, color: "text-accent-purple", opacity: "opacity-[0.05]", animation: "animate-float-slower", delay: "0.8s", desktopOnly: true },
  ],
  experience: [
    { svg: <GitBranch />, position: "top-[3%] right-[3%]", size: SIZE_MD, color: "text-accent-purple", opacity: "opacity-[0.05]", animation: "animate-float-slow", delay: "0.5s" },
    { svg: <CodeComment />, position: "bottom-[12%] left-[2%]", size: SIZE_MD, color: "text-accent-cyan", opacity: "opacity-[0.05]", animation: "animate-float-slower", delay: "2s", desktopOnly: true },
    { svg: <TrendingLine />, position: "top-[50%] right-[2%]", size: SIZE_SM, color: "text-accent-emerald", opacity: "opacity-[0.05]", animation: "animate-float", delay: "1s", desktopOnly: true },
  ],
  projects: [
    { svg: <ComponentTag />, position: "top-[3%] right-[3%]", size: SIZE_MD, color: "text-accent-purple", opacity: "opacity-[0.05]", animation: "animate-float", delay: "0s" },
    { svg: <Candlestick />, position: "bottom-[5%] left-[3%]", size: SIZE_SM, color: "text-accent-cyan", opacity: "opacity-[0.05]", animation: "animate-float-slow", delay: "1.5s", desktopOnly: true },
  ],
  skills: [
    { svg: <Binary />, position: "top-[4%] right-[3%]", size: SIZE_MD, color: "text-accent-cyan", opacity: "opacity-[0.06]", animation: "animate-float", delay: "0s" },
    { svg: <CircuitNode />, position: "bottom-[8%] left-[3%]", size: SIZE_LG, color: "text-accent-emerald", opacity: "opacity-[0.05]", animation: "animate-float-slower", delay: "2s", desktopOnly: true },
    { svg: <HashSymbol />, position: "top-[45%] right-[2%]", size: SIZE_SM, color: "text-accent-purple", opacity: "opacity-[0.05]", animation: "animate-float-slow", delay: "1s", desktopOnly: true },
  ],
  contact: [
    { svg: <AtSymbol />, position: "top-[5%] right-[3%]", size: SIZE_MD, color: "text-accent-cyan", opacity: "opacity-[0.06]", animation: "animate-float", delay: "0s" },
    { svg: <PulseWave />, position: "bottom-[12%] left-[2%]", size: SIZE_LG, color: "text-accent-purple", opacity: "opacity-[0.05]", animation: "animate-float-slow", delay: "1.5s", desktopOnly: true },
    { svg: <DollarSign />, position: "top-[40%] right-[4%]", size: SIZE_SM, color: "text-accent-emerald", opacity: "opacity-[0.05]", animation: "animate-float-slower", delay: "0.8s", desktopOnly: true },
  ],
};

interface SectionDecorationsProps {
  variant: keyof typeof SECTIONS;
}

export default function SectionDecorations({ variant }: SectionDecorationsProps) {
  const items = SECTIONS[variant];
  if (!items) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
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

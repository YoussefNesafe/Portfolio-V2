/* ── Inline SVG shapes ── */

export const AngleBrackets = () => (
  <svg viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16 10L6 20L16 30"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M34 10L44 20L34 30"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M28 6L22 34"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const CurlyBraces = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14 6C10 6 8 8 8 12V16C8 18 6 20 6 20C6 20 8 22 8 24V28C8 32 10 34 14 34"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M26 6C30 6 32 8 32 12V16C32 18 34 20 34 20C34 20 32 22 32 24V28C32 32 30 34 26 34"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const ArrowFunction = () => (
  <svg viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6 15H30"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M26 8L34 15L26 22"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="42" cy="15" r="3" fill="currentColor" />
  </svg>
);

export const TerminalPrompt = () => (
  <svg viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6 8L16 15L6 22"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 22H44"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const CodeComment = () => (
  <svg viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8 8L16 8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M8 15L32 15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.6"
    />
    <path
      d="M8 22L24 22"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.4"
    />
  </svg>
);

export const HashSymbol = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14 8L10 32M26 8L22 32M8 16H34M6 26H32"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const Binary = () => (
  <svg viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="4" y="18" fill="currentColor" fontSize="14" fontFamily="monospace">
      01
    </text>
    <text
      x="30"
      y="34"
      fill="currentColor"
      fontSize="14"
      fontFamily="monospace"
      opacity="0.6"
    >
      10
    </text>
  </svg>
);

export const AtSymbol = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M27 20C27 24 28 27 31 27C35 27 36 23 36 20C36 11.16 28.84 4 20 4C11.16 4 4 11.16 4 20C4 28.84 11.16 36 20 36C24 36 27.5 34.5 30 32"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const Candlestick = () => (
  <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line
      x1="12"
      y1="6"
      x2="12"
      y2="44"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.4"
    />
    <rect
      x="8"
      y="14"
      width="8"
      height="16"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="currentColor"
      fillOpacity="0.15"
    />
    <line
      x1="28"
      y1="10"
      x2="28"
      y2="40"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.4"
    />
    <rect
      x="24"
      y="20"
      width="8"
      height="12"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <line
      x1="44"
      y1="4"
      x2="44"
      y2="38"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.4"
    />
    <rect
      x="40"
      y="8"
      width="8"
      height="18"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="currentColor"
      fillOpacity="0.15"
    />
  </svg>
);

export const BarChart = () => (
  <svg viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="6"
      y="24"
      width="8"
      height="12"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="currentColor"
      fillOpacity="0.1"
    />
    <rect
      x="18"
      y="14"
      width="8"
      height="22"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="currentColor"
      fillOpacity="0.1"
    />
    <rect
      x="30"
      y="8"
      width="8"
      height="28"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="currentColor"
      fillOpacity="0.15"
    />
    <rect
      x="42"
      y="18"
      width="8"
      height="18"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="currentColor"
      fillOpacity="0.1"
    />
  </svg>
);

export const TrendingLine = () => (
  <svg viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 32L16 22L26 28L46 8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M36 8H46V18"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const PulseWave = () => (
  <svg viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 15H14L18 4L24 26L30 10L34 15H56"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const GitBranch = () => (
  <svg viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="20" cy="42" r="4" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="34" cy="24" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M20 12V38" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M20 18C20 18 20 24 34 24"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const DollarSign = () => (
  <svg viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M15 4V36"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M22 12C22 8 19 6 15 6C11 6 8 8 8 12C8 16 11 18 15 20C19 22 22 24 22 28C22 32 19 34 15 34C11 34 8 32 8 28"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const LaptopIcon = () => (
  <svg viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="6"
      y="10"
      width="52"
      height="30"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="currentColor"
      fillOpacity="0.02"
    />
    <rect
      x="12"
      y="16"
      width="40"
      height="18"
      rx="1"
      stroke="currentColor"
      strokeWidth="1"
    />
    <path d="M2 44H62" stroke="currentColor" strokeWidth="1" opacity="0.4" />
  </svg>
);

export const Wallet = () => (
  <svg viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="4"
      y="8"
      width="36"
      height="20"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="currentColor"
      fillOpacity="0.03"
    />
    <path
      d="M40 12H44V24H40"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="14" cy="18" r="2" fill="currentColor" />
  </svg>
);

export const CreditCard = () => (
  <svg viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="4"
      y="8"
      width="40"
      height="20"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="currentColor"
      fillOpacity="0.02"
    />
    <rect
      x="8"
      y="14"
      width="12"
      height="4"
      rx="1"
      fill="currentColor"
      opacity="0.7"
    />
    <rect
      x="26"
      y="20"
      width="10"
      height="3"
      rx="1"
      fill="currentColor"
      opacity="0.5"
    />
  </svg>
);

export const Cloud = () => (
  <svg viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M18 22H44C48 22 52 19 53 15C55 12 53 8 49 7C47 4 43 2 38 2C30 2 25 6 22 10C18 10 14 12 12 16C8 17 6 20 6 24C6 27 10 30 14 30H18"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="currentColor"
      fillOpacity="0.02"
    />
  </svg>
);

export const Server = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="6"
      y="8"
      width="36"
      height="10"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="currentColor"
      fillOpacity="0.02"
    />
    <rect
      x="6"
      y="20"
      width="36"
      height="10"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="currentColor"
      fillOpacity="0.02"
    />
    <rect
      x="6"
      y="32"
      width="36"
      height="6"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="currentColor"
      fillOpacity="0.02"
    />
    <circle cx="36" cy="13" r="1.5" fill="currentColor" />
    <circle cx="36" cy="25" r="1.5" fill="currentColor" />
    <circle cx="36" cy="35" r="1.5" fill="currentColor" />
  </svg>
);

export const CandlestickColored = () => (
  <svg viewBox="0 0 60 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="18" width="8" height="12" rx="1" fill="#10B981" />
    <rect x="22" y="12" width="8" height="24" rx="1" fill="#EF4444" />
    <rect x="36" y="8" width="8" height="28" rx="1" fill="#10B981" />
    <line
      x1="12"
      y1="6"
      x2="12"
      y2="46"
      stroke="#065E58"
      strokeWidth="0.8"
      opacity="0.4"
    />
    <line
      x1="26"
      y1="6"
      x2="26"
      y2="46"
      stroke="#7F1D1D"
      strokeWidth="0.8"
      opacity="0.4"
    />
    <line
      x1="40"
      y1="6"
      x2="40"
      y2="46"
      stroke="#065E58"
      strokeWidth="0.8"
      opacity="0.4"
    />
  </svg>
);

export const ComponentTag = () => (
  <svg viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14 10L4 20L14 30"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M36 10L46 20L36 30"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CircuitNode = () => (
  <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="25" cy="25" r="5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="25" cy="25" r="2" fill="currentColor" />
    <path
      d="M25 4V20"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <path
      d="M25 30V46"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <path
      d="M4 25H20"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <path
      d="M30 25H46"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

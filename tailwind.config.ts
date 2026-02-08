import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    screens: {
      tablet: "481px",
      desktop: "1024px",
    },
    extend: {
      colors: {
        background: "#0A0A0F",
        "bg-secondary": "#12121A",
        "bg-tertiary": "#1A1A2E",
        foreground: "#E4E4E7",
        "text-heading": "#FAFAFA",
        "text-muted": "#A1A1AA",
        "accent-cyan": "#06B6D4",
        "accent-purple": "#A855F7",
        "accent-emerald": "#10B981",
        "border-subtle": "#1E1E2E",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      keyframes: {
        "blink-cursor": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "blink-cursor": "blink-cursor 1s step-end infinite",
        float: "float 6s ease-in-out infinite",
        "gradient-shift": "gradient-shift 3s ease infinite",
      },
    },
  },
  plugins: [],
};

export default config;

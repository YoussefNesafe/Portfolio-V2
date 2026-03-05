"use client";

import { useEffect, useState } from "react";

interface LogoGlitchProps {
  active: boolean;
  onComplete: () => void;
  duration?: number;
}

export default function LogoGlitch({
  active,
  onComplete,
  duration = 2000,
}: LogoGlitchProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, duration);
    return () => clearTimeout(timer);
  }, [active, duration, onComplete]);

  if (!visible) return null;

  return (
    <style>{`
      @keyframes logo-glitch {
        0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
        10% { clip-path: inset(20% 0 40% 0); transform: translate(-2px, 1px); filter: hue-rotate(90deg); }
        20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); }
        30% { clip-path: inset(10% 0 70% 0); transform: translate(-1px, 2px); filter: hue-rotate(180deg); }
        40% { clip-path: inset(50% 0 20% 0); transform: translate(1px, -2px); }
        50% { clip-path: inset(30% 0 30% 0); transform: translate(-2px, 0); filter: hue-rotate(270deg); }
        60% { clip-path: inset(70% 0 5% 0); transform: translate(2px, 1px); }
        70% { clip-path: inset(5% 0 60% 0); transform: translate(0, -1px); filter: hue-rotate(45deg); }
        80% { clip-path: inset(40% 0 30% 0); transform: translate(-1px, 1px); }
        90% { clip-path: inset(15% 0 50% 0); transform: translate(1px, 0); filter: hue-rotate(135deg); }
      }
      [data-logo-glitch] {
        animation: logo-glitch 0.3s infinite;
        filter: drop-shadow(2px 0 #06B6D4) drop-shadow(-2px 0 #A855F7);
      }
    `}</style>
  );
}

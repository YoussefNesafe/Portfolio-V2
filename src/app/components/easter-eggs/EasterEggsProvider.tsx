"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { EasterEggsContext } from "./EasterEggsContext";
import { useKonamiCode } from "./hooks/useKonamiCode";
import { useSecretWord } from "./hooks/useSecretWord";
import { printConsoleMessage } from "./console-message";
import MatrixRain from "./effects/MatrixRain";
import SecretMessage from "./effects/SecretMessage";
import HireToast from "./effects/HireToast";
import LogoGlitch from "./effects/LogoGlitch";

const LOGO_CLICK_THRESHOLD = 5;
const LOGO_CLICK_TIMEOUT = 2000;
const SECRET_WORDS = ["hire", "hello"];

export default function EasterEggsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showMatrix, setShowMatrix] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [logoGlitch, setLogoGlitch] = useState(false);
  const [showHireToast, setShowHireToast] = useState(false);
  const [triggerHelloEgg, setTriggerHelloEgg] = useState(false);

  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Console message — fire once
  useEffect(() => {
    printConsoleMessage();
  }, []);

  // Konami code handler
  useKonamiCode(
    useCallback(() => {
      if (!showMatrix && !showSecret) {
        setShowMatrix(true);
      }
    }, [showMatrix, showSecret]),
  );

  // Secret word handler
  useSecretWord(
    SECRET_WORDS,
    useCallback(
      (word: string) => {
        if (word === "hire" && !showHireToast) {
          setShowHireToast(true);
        }
        if (word === "hello") {
          setTriggerHelloEgg(true);
          setTimeout(() => setTriggerHelloEgg(false), 3000);
        }
      },
      [showHireToast],
    ),
  );

  // Logo click handler
  const onLogoClick = useCallback(() => {
    logoClickCount.current++;
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    logoClickTimer.current = setTimeout(() => {
      logoClickCount.current = 0;
    }, LOGO_CLICK_TIMEOUT);

    if (logoClickCount.current >= LOGO_CLICK_THRESHOLD) {
      logoClickCount.current = 0;
      setLogoGlitch(true);
    }
  }, []);

  return (
    <EasterEggsContext.Provider value={{ onLogoClick, triggerHelloEgg }}>
      {children}

      {showMatrix && (
        <MatrixRain
          onComplete={() => {
            setShowMatrix(false);
            setShowSecret(true);
          }}
        />
      )}

      <AnimatePresence>
        {showSecret && (
          <SecretMessage onDismiss={() => setShowSecret(false)} />
        )}
      </AnimatePresence>

      <LogoGlitch
        active={logoGlitch}
        onComplete={() => setLogoGlitch(false)}
      />

      <AnimatePresence>
        {showHireToast && (
          <HireToast onDismiss={() => setShowHireToast(false)} />
        )}
      </AnimatePresence>
    </EasterEggsContext.Provider>
  );
}

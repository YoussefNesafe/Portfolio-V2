"use client";

import { useState, useCallback, useEffect } from "react";
import { ViewModeContext, type ViewMode } from "./ViewModeContext";

const STORAGE_KEY = "portfolio-view-mode";

export default function ViewModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<ViewMode>("designer");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dev" || stored === "designer") {
      setMode(stored);
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === "designer" ? "dev" : "designer";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <ViewModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

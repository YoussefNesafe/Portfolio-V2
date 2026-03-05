"use client";

import { createContext, useContext } from "react";

export type ViewMode = "designer" | "dev";

interface ViewModeContextType {
  mode: ViewMode;
  toggleMode: () => void;
}

export const ViewModeContext = createContext<ViewModeContextType>({
  mode: "designer",
  toggleMode: () => {},
});

export function useViewMode() {
  return useContext(ViewModeContext);
}

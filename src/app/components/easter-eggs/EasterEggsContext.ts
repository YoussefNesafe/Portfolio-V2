"use client";

import { createContext, useContext } from "react";

interface EasterEggsContextType {
  onLogoClick: () => void;
  triggerHelloEgg: boolean;
}

export const EasterEggsContext = createContext<EasterEggsContextType>({
  onLogoClick: () => {},
  triggerHelloEgg: false,
});

export function useEasterEggs() {
  return useContext(EasterEggsContext);
}

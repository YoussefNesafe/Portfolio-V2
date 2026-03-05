"use client";

import { createContext, useContext } from "react";

interface EasterEggsContextType {
  onLogoClick: () => void;
  triggerHelloEgg: boolean;
  triggerMatrix: () => void;
}

export const EasterEggsContext = createContext<EasterEggsContextType>({
  onLogoClick: () => {},
  triggerHelloEgg: false,
  triggerMatrix: () => {},
});

export function useEasterEggs() {
  return useContext(EasterEggsContext);
}

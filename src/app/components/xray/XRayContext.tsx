"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface XRayContextType {
  isActive: boolean;
  toggle: () => void;
}

const XRayContext = createContext<XRayContextType>({
  isActive: false,
  toggle: () => {},
});

export function useXRay() {
  return useContext(XRayContext);
}

export function XRayProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);

  const toggle = useCallback(() => {
    setIsActive((prev) => !prev);
  }, []);

  return (
    <XRayContext.Provider value={{ isActive, toggle }}>
      {children}
    </XRayContext.Provider>
  );
}

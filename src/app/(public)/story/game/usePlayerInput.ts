"use client";

import { useEffect, useRef, useCallback } from "react";

interface InputState {
  left: boolean;
  right: boolean;
}

export function usePlayerInput() {
  const keys = useRef<InputState>({ left: false, right: false });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") keys.current.left = true;
    if (e.key === "ArrowRight") keys.current.right = true;
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") keys.current.left = false;
    if (e.key === "ArrowRight") keys.current.right = false;
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return keys;
}

"use client";

import { useEffect, useRef, useCallback } from "react";

interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
  down: boolean;
  blast: boolean;
  teleport: boolean;
}

export function usePlayerInput() {
  const keys = useRef<InputState>({
    left: false, right: false, jump: false, sprint: false,
    down: false, blast: false, teleport: false,
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") keys.current.left = true;
    if (e.key === "ArrowRight") keys.current.right = true;
    if (e.key === "ArrowDown") keys.current.down = true;
    if (e.key === " ") { keys.current.jump = true; e.preventDefault(); }
    if (e.key === "Shift") keys.current.sprint = true;
    if (e.key === "x" || e.key === "X") keys.current.blast = true;
    if (e.key === "c" || e.key === "C") keys.current.teleport = true;
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") keys.current.left = false;
    if (e.key === "ArrowRight") keys.current.right = false;
    if (e.key === "ArrowDown") keys.current.down = false;
    if (e.key === " ") keys.current.jump = false;
    if (e.key === "Shift") keys.current.sprint = false;
    if (e.key === "x" || e.key === "X") keys.current.blast = false;
    if (e.key === "c" || e.key === "C") keys.current.teleport = false;
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

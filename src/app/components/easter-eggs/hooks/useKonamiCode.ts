import { useEffect, useRef, useCallback } from "react";

export const KONAMI_SEQUENCE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
] as const;

export function matchesKonamiSequence(buffer: string[]): boolean {
  if (buffer.length !== KONAMI_SEQUENCE.length) return false;
  return buffer.every((key, i) => key === KONAMI_SEQUENCE[i]);
}

export function useKonamiCode(onActivate: () => void) {
  const bufferRef = useRef<string[]>([]);
  const onActivateRef = useRef(onActivate);

  useEffect(() => {
    onActivateRef.current = onActivate;
  }, [onActivate]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    bufferRef.current = [...bufferRef.current, e.key].slice(-KONAMI_SEQUENCE.length);
    if (matchesKonamiSequence(bufferRef.current)) {
      bufferRef.current = [];
      onActivateRef.current();
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

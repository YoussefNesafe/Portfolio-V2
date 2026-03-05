import { useEffect, useRef, useCallback } from "react";

export function checkWordMatch(buffer: string[], words: string[]): string | null {
  const joined = buffer.join("").toLowerCase();
  for (const word of words) {
    if (joined.endsWith(word)) return word;
  }
  return null;
}

export function useSecretWord(
  words: string[],
  onMatch: (word: string) => void,
) {
  const bufferRef = useRef<string[]>([]);
  const onMatchRef = useRef(onMatch);
  const maxLen = Math.max(...words.map((w) => w.length), 0);

  useEffect(() => {
    onMatchRef.current = onMatch;
  }, [onMatch]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key.length !== 1) return;
      bufferRef.current = [...bufferRef.current, e.key].slice(-maxLen);
      const matched = checkWordMatch(bufferRef.current, words);
      if (matched) {
        bufferRef.current = [];
        onMatchRef.current(matched);
      }
    },
    [words, maxLen],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

const WORDS_PER_MINUTE = 200;

export function calculateReadingTime(htmlContent: string): number {
  const textContent = htmlContent.replace(/<[^>]*>/g, "");
  const wordCount = textContent.split(/\s+/).filter(Boolean).length;
  return Math.ceil(wordCount / WORDS_PER_MINUTE);
}

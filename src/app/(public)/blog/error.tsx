"use client";

// NOTE: This component uses a direct JSON import instead of getDictionary() because
// Next.js error boundaries have a fixed signature and cannot receive props from a
// server parent. This is an intentional exception to the prop-drilling pattern.
import en from "@/dictionaries/en.json";

export default function BlogError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { title, description, retry } = en.blog.error;

  return (
    <div className="flex flex-col items-center justify-center py-[13.333vw] tablet:py-[6.667vw] desktop:py-[2.778vw]">
      <h2 className="text-text-heading text-[6.4vw] tablet:text-[3vw] desktop:text-[1.25vw] font-bold mb-[4vw] tablet:mb-[2vw] desktop:mb-[0.833vw]">
        {title}
      </h2>
      <p className="text-text-muted text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.75vw] mb-[5.333vw] tablet:mb-[2.5vw] desktop:mb-[1.042vw]">
        {description}
      </p>
      <button
        onClick={reset}
        className="btn-gradient px-[5.333vw] tablet:px-[2.5vw] desktop:px-[1.042vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] rounded-lg text-white font-medium text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]"
      >
        {retry}
      </button>
    </div>
  );
}

"use client";

export default function BlogError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-[13.333vw] tablet:py-[6.667vw] desktop:py-[2.778vw]">
      <h2 className="text-text-heading text-[6.4vw] tablet:text-[3vw] desktop:text-[1.25vw] font-bold mb-[4vw] tablet:mb-[2vw] desktop:mb-[0.833vw]">
        Something went wrong
      </h2>
      <p className="text-text-muted text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.75vw] mb-[5.333vw] tablet:mb-[2.5vw] desktop:mb-[1.042vw]">
        Failed to load blog content. Please try again.
      </p>
      <button
        onClick={reset}
        className="btn-gradient px-[5.333vw] tablet:px-[2.5vw] desktop:px-[1.042vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] rounded-lg text-white font-medium text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]"
      >
        Try again
      </button>
    </div>
  );
}

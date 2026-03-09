import Link from "next/link";

export const metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist or has been moved.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-[5.333vw] tablet:px-[2.667vw] desktop:px-[1.111vw]">
      <p className="text-accent-cyan text-[4.267vw] tablet:text-[2vw] desktop:text-[0.833vw] font-mono mb-[2.667vw] tablet:mb-[1.333vw] desktop:mb-[0.556vw]">
        404
      </p>
      <h1 className="text-text-heading text-[8vw] tablet:text-[4vw] desktop:text-[1.667vw] font-bold mb-[2.667vw] tablet:mb-[1.333vw] desktop:mb-[0.556vw]">
        Page Not Found
      </h1>
      <p className="text-text-muted text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.75vw] mb-[8vw] tablet:mb-[4vw] desktop:mb-[1.667vw] text-center max-w-[80vw] tablet:max-w-[50vw] desktop:max-w-[25vw]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-[4vw] tablet:gap-[2vw] desktop:gap-[0.833vw]">
        <Link
          href="/"
          className="btn-gradient px-[5.333vw] tablet:px-[2.5vw] desktop:px-[1.042vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] rounded-lg text-white font-medium text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]"
        >
          Go Home
        </Link>
        <Link
          href="/blog"
          className="px-[5.333vw] tablet:px-[2.5vw] desktop:px-[1.042vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] rounded-lg border border-border-subtle text-text-muted hover:text-foreground hover:border-accent-cyan/50 transition-colors text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]"
        >
          Read Blog
        </Link>
      </div>
    </div>
  );
}

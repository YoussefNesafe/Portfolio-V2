"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function StoryButton() {
  const pathname = usePathname();

  if (pathname === "/story") return null;

  return (
    <div className="hidden desktop:block fixed bottom-[0.7vw] right-[0.833vw] z-40">
      <Link
        href="/story"
        className="flex items-center justify-center w-[2.083vw] h-[2.083vw] rounded-full bg-[#FF6B00]/10 backdrop-blur-lg border border-[#FF6B00]/30 text-[#FFD700] cursor-pointer transition-all duration-300 hover:bg-[#FF6B00]/20 hover:border-[#FF6B00]/60 hover:shadow-[0_0_12px_rgba(255,107,0,0.4)]"
        aria-label="Story Mode"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-[0.833vw] h-[0.833vw]"
          fill="currentColor"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <circle cx="12" cy="7" r="1.5" fill="currentColor" />
          <circle cx="12" cy="17" r="1.5" fill="currentColor" />
          <circle cx="7" cy="12" r="1.5" fill="currentColor" />
          <circle cx="17" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </Link>
    </div>
  );
}

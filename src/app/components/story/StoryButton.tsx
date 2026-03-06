"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { FiBookOpen } from "react-icons/fi";

export default function StoryButton() {
  const pathname = usePathname();

  if (pathname === "/story") return null;

  return (
    <div className="hidden desktop:block fixed bottom-[3.125vw] right-[0.833vw] z-40">
      <Link
        href="/story"
        className="flex items-center justify-center w-[10.667vw] h-[10.667vw] tablet:w-[5vw] tablet:h-[5vw] desktop:w-[2.083vw] desktop:h-[2.083vw] rounded-full bg-bg-secondary/90 backdrop-blur-lg border border-border-subtle text-text-muted cursor-pointer transition-all duration-300 hover:text-accent-cyan hover:border-accent-cyan/40 hover:shadow-[0_0_12px_theme(colors.accent-cyan/30)]"
        aria-label="Interactive Story"
      >
        <FiBookOpen className="w-[4.267vw] h-[4.267vw] tablet:w-[2vw] tablet:h-[2vw] desktop:w-[0.833vw] desktop:h-[0.833vw]" />
      </Link>
    </div>
  );
}

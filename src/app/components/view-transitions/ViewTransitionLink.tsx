"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function ViewTransitionHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!("startViewTransition" in document)) return;

    const handleClick = (e: Event) => {
      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip external links, anchor links, mailto, tel
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.includes("/#")
      ) return;

      // Skip if modifier keys held (new tab, etc.)
      const mouseEvent = e as MouseEvent;
      if (mouseEvent.metaKey || mouseEvent.ctrlKey || mouseEvent.shiftKey) return;

      // Skip if target="_blank"
      if (anchor.target === "_blank") return;

      // Skip if same page
      if (href === pathname) return;

      e.preventDefault();
      document.startViewTransition(() => {
        router.push(href);
      });
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [router, pathname]);

  return null;
}

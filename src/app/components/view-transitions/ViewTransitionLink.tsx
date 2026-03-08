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

      // Skip external links, mailto, tel
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) return;

      // Skip same-page anchor links (e.g. #hero on homepage)
      if (href.startsWith("#")) return;

      // Skip if modifier keys held (new tab, etc.)
      const mouseEvent = e as MouseEvent;
      if (mouseEvent.metaKey || mouseEvent.ctrlKey || mouseEvent.shiftKey) return;

      // Skip if target="_blank"
      if (anchor.target === "_blank") return;

      // Extract the path portion (e.g. "/#hero" → "/", "/blog" → "/blog")
      const targetPath = href.split("#")[0] || "/";

      // Skip if navigating to same page (anchor jump only)
      if (targetPath === pathname) return;

      e.preventDefault();

      // Set iris reveal origin to click position
      const x = mouseEvent.clientX;
      const y = mouseEvent.clientY;
      const maxRadius = Math.hypot(x, y);
      document.documentElement.style.setProperty("--iris-x", `${x}px`);
      document.documentElement.style.setProperty("--iris-y", `${y}px`);
      document.documentElement.style.setProperty("--iris-radius", `${maxRadius}px`);

      document.startViewTransition(() => {
        router.push(href);
      });
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [router, pathname]);

  return null;
}

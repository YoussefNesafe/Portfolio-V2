"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FiHome,
  FiFileText,
  FiFolder,
  FiTag,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: FiHome },
  { href: "/admin/posts", label: "Posts", icon: FiFileText },
  { href: "/admin/categories", label: "Categories", icon: FiFolder },
  { href: "/admin/tags", label: "Tags", icon: FiTag },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Continue to login page even if logout request fails
    }
    window.location.href = "/admin/login";
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={mobileOpen}
        className="desktop:hidden fixed top-[4vw] left-[4vw] z-50 p-[2vw] bg-bg-secondary border border-border-subtle rounded-lg text-foreground"
      >
        {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          role="presentation"
          aria-hidden="true"
          className="desktop:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-[60vw] tablet:w-[30vw] desktop:w-[13.542vw] bg-bg-secondary border-r border-border-subtle z-40 flex flex-col transition-transform duration-300 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full desktop:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw] border-b border-border-subtle">
          <Link
            href="/admin"
            className="text-text-heading font-bold text-[4.267vw] tablet:text-[2vw] desktop:text-[0.833vw]"
          >
            Admin Panel
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-[2.667vw] tablet:p-[1.333vw] desktop:p-[0.556vw] space-y-[1.333vw] tablet:space-y-[0.667vw] desktop:space-y-[0.278vw]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw] px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] rounded-lg text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] transition-colors ${
                  active
                    ? "bg-accent-cyan/10 text-accent-cyan"
                    : "text-text-muted hover:bg-bg-tertiary hover:text-foreground"
                }`}
              >
                <Icon
                  className="w-[4vw] h-[4vw] tablet:w-[2vw] tablet:h-[2vw] desktop:w-[0.833vw] desktop:h-[0.833vw]"
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-[2.667vw] tablet:p-[1.333vw] desktop:p-[0.556vw] border-t border-border-subtle">
          <button
            onClick={handleLogout}
            className="flex items-center gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw] px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] rounded-lg text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
          >
            <FiLogOut className="w-[4vw] h-[4vw] tablet:w-[2vw] tablet:h-[2vw] desktop:w-[0.833vw] desktop:h-[0.833vw]" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

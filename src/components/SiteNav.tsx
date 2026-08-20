"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  {
    href: "/classes/math",
    label: "Math",
    match: (p: string) => p === "/classes/math" || p.startsWith("/classes/math/"),
  },
  {
    href: "/classes/chess",
    label: "Chess",
    match: (p: string) =>
      p === "/classes/chess" || p.startsWith("/classes/chess/"),
  },
];

export function SiteNav() {
  const pathname = usePathname();

  // The admin section has its own chrome; keep the public nav off /admin.
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
        >
          101Discoveries
        </Link>
        <nav className="flex items-center gap-1">
          {LINKS.map((link) => {
            const active = link.match(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-900 hover:text-white dark:text-zinc-400 dark:hover:bg-white dark:hover:text-zinc-900",
                ].join(" ")}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

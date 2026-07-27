"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Classes", match: (p: string) => p === "/admin" || p.startsWith("/admin/classes") },
  { href: "/admin/locations", label: "Locations", match: (p: string) => p.startsWith("/admin/locations") },
  { href: "/admin/semesters", label: "Semesters", match: (p: string) => p.startsWith("/admin/semesters") },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 sm:flex">
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
  );
}

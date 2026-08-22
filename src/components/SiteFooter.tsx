"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();

  // The admin section has its own chrome; no need for the public footer there.
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-zinc-500 sm:flex-row dark:text-zinc-400">
        <p>© {new Date().getFullYear()} 101 Discoveries</p>
        <Link
          href="/admin/login"
          className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-900 hover:text-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-white dark:hover:text-zinc-900"
        >
          Staff Sign-in
        </Link>
      </div>
    </footer>
  );
}

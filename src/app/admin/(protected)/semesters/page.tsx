import Link from "next/link";
import type { Metadata } from "next";
import { getAdminTerms } from "@/lib/admin";
import { SemesterForm } from "./SemesterForm";

export const metadata: Metadata = {
  title: "Semesters — 101 Discoveries Admin",
};

export default async function SemestersPage() {
  const terms = await getAdminTerms();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← All classes
      </Link>

      <h1 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Semesters
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Terms available when creating a class.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <SemesterForm />

        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Existing ({terms.length})
          </h2>
          {terms.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">No semesters yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-100 rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {terms.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {t.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {t.start_date} → {t.end_date}
                    </p>
                  </div>
                  {!t.is_active && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      Inactive
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}

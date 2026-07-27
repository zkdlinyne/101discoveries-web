import Link from "next/link";
import type { Metadata } from "next";
import { getAdminLocations } from "@/lib/admin";
import { LocationForm } from "./LocationForm";

export const metadata: Metadata = {
  title: "Locations — 101Discoveries Admin",
};

export default async function LocationsPage() {
  const locations = await getAdminLocations();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← All classes
      </Link>

      <h1 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Locations
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Locations available when creating a class.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <LocationForm />

        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Existing ({locations.length})
          </h2>
          {locations.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">No locations yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-100 rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {locations.map((l) => (
                <li key={l.id} className="px-4 py-3">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {l.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {[l.address, [l.city, l.state].filter(Boolean).join(", ")]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}

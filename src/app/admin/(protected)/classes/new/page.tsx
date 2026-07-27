import Link from "next/link";
import type { Metadata } from "next";
import { getAdminLocations, getAdminTerms } from "@/lib/admin";
import { ClassForm } from "../ClassForm";
import { EMPTY_CLASS_VALUES } from "../form-state";
import { createClassAction } from "./actions";

export const metadata: Metadata = {
  title: "New class — 101Discoveries Admin",
};

export default async function NewClassPage() {
  const [terms, locations] = await Promise.all([
    getAdminTerms(),
    getAdminLocations(),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← All classes
      </Link>

      <h1 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        New class
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Add a class to the catalog. Leave it unpublished to set it up before it
        goes live.
      </p>

      <ClassForm
        terms={terms}
        locations={locations}
        action={createClassAction}
        initialValues={EMPTY_CLASS_VALUES}
        submitLabel="Create class"
        pendingLabel="Creating…"
      />
    </main>
  );
}

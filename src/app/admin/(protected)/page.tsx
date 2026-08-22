import Link from "next/link";
import type { Metadata } from "next";
import { getAdminClassSummaries, type ClassSummary } from "@/lib/admin";
import { DeleteClassButton } from "./DeleteClassButton";

export const metadata: Metadata = {
  title: "Dashboard — 101 Discoveries Admin",
};

export default async function AdminOverviewPage() {
  const classes = await getAdminClassSummaries();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Classes
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Enrollment and payment status across all classes.
          </p>
        </div>
        <Link
          href="/admin/classes/new"
          className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          + New class
        </Link>
      </div>

      {classes.length === 0 ? (
        <p className="mt-10 text-sm text-zinc-500">No classes yet.</p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Class</th>
                <th className="px-4 py-3 font-medium">Enrolled</th>
                <th className="px-4 py-3 font-medium">Paid</th>
                <th className="px-4 py-3 font-medium">Pending</th>
                <th className="px-4 py-3 font-medium">Waitlist</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {classes.map((c) => (
                <ClassRow key={c.id} c={c} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function ClassRow({ c }: { c: ClassSummary }) {
  const full = c.counts.enrolled >= c.capacity;
  const registrationCount =
    c.counts.paid +
    c.counts.pending +
    c.counts.waitlisted +
    c.counts.cancelled +
    c.counts.refunded;
  return (
    <tr className="group bg-white hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900">
      <td className="px-4 py-3">
        <Link
          href={`/admin/classes/${c.id}`}
          className="font-medium text-zinc-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400"
        >
          {c.title}
        </Link>
        <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="capitalize">{c.category}</span>
          {c.termName ? ` · ${c.termName}` : ""} · {c.status}
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={
            full
              ? "font-semibold text-amber-600 dark:text-amber-400"
              : "text-zinc-700 dark:text-zinc-300"
          }
        >
          {c.counts.enrolled} / {c.capacity}
        </span>
      </td>
      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
        {c.counts.paid}
      </td>
      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
        {c.counts.pending}
      </td>
      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
        {c.counts.waitlisted}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/admin/classes/${c.id}`}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            View roster →
          </Link>
          <Link
            href={`/admin/classes/${c.id}/edit`}
            aria-label={`Edit ${c.title}`}
            title={`Edit ${c.title}`}
            className="rounded-md p-1.5 text-zinc-400 opacity-0 transition-opacity hover:bg-indigo-50 hover:text-indigo-600 focus-visible:opacity-100 group-hover:opacity-100 dark:hover:bg-indigo-950 dark:hover:text-indigo-400"
          >
            <PencilIcon />
          </Link>
          <DeleteClassButton
            classId={c.id}
            title={c.title}
            registrationCount={registrationCount}
          />
        </div>
      </td>
    </tr>
  );
}

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-.793.793-2.828-2.828.793-.793ZM11.379 5.793 3 14.172V17h2.828l8.38-8.379-2.83-2.828Z" />
    </svg>
  );
}

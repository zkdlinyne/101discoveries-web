import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getClassBySlug } from "@/lib/classes";
import { formatGradeRange, formatPrice, formatSchedule } from "@/lib/format";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const c = await getClassBySlug(slug);
  if (!c) return { title: "Class not found — 101Discoveries" };
  return {
    title: `${c.title} — 101Discoveries`,
    description: c.description ?? undefined,
  };
}

export default async function ClassDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const c = await getClassBySlug(slug);

  if (!c) notFound();

  const schedule = formatSchedule(c.day_of_week, c.start_time, c.end_time);
  const isWaitlist = c.status === "waitlist" || c.status === "full";
  const isClosed = c.status === "closed" || c.status === "draft";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 sm:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Back to catalog
      </Link>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold capitalize text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          {c.category}
        </span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          Grades {formatGradeRange(c.grade_min, c.grade_max)}
        </span>
        {c.term && (
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {c.term.name}
          </span>
        )}
      </div>

      <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {c.title}
      </h1>

      {c.description && (
        <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          {c.description}
        </p>
      )}

      <dl className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-800">
        <DetailRow label="Schedule" value={schedule ?? "To be announced"} />
        <DetailRow
          label="Location"
          value={
            c.location
              ? `${c.location.name} · ${c.location.city}, ${c.location.state}`
              : "To be announced"
          }
        />
        <DetailRow
          label="Grades"
          value={`Grades ${formatGradeRange(c.grade_min, c.grade_max)}`}
        />
        <DetailRow label="Tuition" value={`${formatPrice(c.price_cents)} per student`} />
      </dl>

      <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        {isClosed ? (
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-6 py-3 text-sm font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            Registration closed
          </span>
        ) : (
          <Link
            href={`/classes/${c.slug}/register`}
            className="inline-flex items-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {isWaitlist ? "Join the waitlist" : "Register now"}
          </Link>
        )}
        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {formatPrice(c.price_cents)}
        </p>
      </div>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-5 dark:bg-zinc-900">
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}

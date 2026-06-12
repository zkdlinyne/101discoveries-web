import Link from "next/link";
import { getPublishedClasses, type CatalogClass } from "@/lib/classes";
import { formatGradeRange, formatPrice, formatSchedule } from "@/lib/format";

export default async function Home() {
  const classes = await getPublishedClasses();
  const term = classes.find((c) => c.term)?.term ?? null;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16 sm:py-24">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          101Discoveries{term ? ` · ${term.name}` : ""}
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Class Catalog
        </h1>
        <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Chess and math enrichment classes for K–8 students in Jersey City.
          Browse the lineup and reserve your child&apos;s spot.
        </p>
      </header>

      {classes.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <ClassCard key={c.id} c={c} />
          ))}
        </ul>
      )}
    </main>
  );
}

function ClassCard({ c }: { c: CatalogClass }) {
  const schedule = formatSchedule(c.day_of_week, c.start_time, c.end_time);
  const isWaitlist = c.status === "waitlist" || c.status === "full";

  return (
    <li className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-2">
          <CategoryBadge category={c.category} />
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            Grades {formatGradeRange(c.grade_min, c.grade_max)}
          </span>
        </div>

        <h2 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {c.title}
        </h2>

        {c.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {c.description}
          </p>
        )}

        <dl className="mt-5 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
          {schedule && (
            <div className="flex items-center gap-2">
              <dt className="sr-only">Schedule</dt>
              <dd>{schedule}</dd>
            </div>
          )}
          {c.location && (
            <div className="flex items-center gap-2">
              <dt className="sr-only">Location</dt>
              <dd>
                {c.location.name} · {c.location.city}, {c.location.state}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex items-end justify-between gap-3 border-t border-zinc-100 pt-5 dark:border-zinc-800">
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {formatPrice(c.price_cents)}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              per student
            </p>
          </div>
          <Link
            href={`/classes/${c.slug}`}
            className="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {isWaitlist ? "Join waitlist" : "Register"}
          </Link>
        </div>
      </div>
    </li>
  );
}

function CategoryBadge({ category }: { category: CatalogClass["category"] }) {
  const styles: Record<CatalogClass["category"], string> = {
    chess:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    math: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[category]}`}
    >
      {category}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="mt-16 rounded-2xl border border-dashed border-zinc-300 py-20 text-center dark:border-zinc-700">
      <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
        No classes available yet
      </p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Check back soon — new classes are added each term.
      </p>
    </div>
  );
}

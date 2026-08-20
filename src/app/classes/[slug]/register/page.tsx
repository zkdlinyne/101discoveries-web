import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getClassBySlug } from "@/lib/classes";
import { formatGradeRange, formatPrice, formatSchedule } from "@/lib/format";
import { RegisterForm } from "./RegisterForm";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ canceled?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const c = await getClassBySlug(slug);
  return {
    title: c ? `Register · ${c.title} — 101Discoveries` : "Register",
  };
}

export default async function RegisterPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { canceled } = await searchParams;
  const c = await getClassBySlug(slug);

  if (!c) notFound();

  const schedule = formatSchedule(c.day_of_week, c.start_time, c.end_time);
  const isClosed = c.status === "draft" || c.status === "closed";

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12 sm:py-16">
      <Link
        href="/classes"
        className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Back to catalog
      </Link>

      <h1 className="mt-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
        Register for {c.title}
      </h1>

      {canceled && (
        <p className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Checkout was canceled — your spot isn&apos;t paid yet. You can complete
          your registration below.
        </p>
      )}

      <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {formatPrice(c.price_cents)}
          </span>
          <span>·</span>
          <span>Grades {formatGradeRange(c.grade_min, c.grade_max)}</span>
          {schedule && (
            <>
              <span>·</span>
              <span>{schedule}</span>
            </>
          )}
        </div>
        {c.location && (
          <p className="mt-1">
            {c.location.name} · {c.location.city}, {c.location.state}
          </p>
        )}
      </div>

      {isClosed ? (
        <p className="mt-10 rounded-lg bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          Registration for this class is currently closed.
        </p>
      ) : (
        <RegisterForm slug={c.slug} />
      )}
    </main>
  );
}

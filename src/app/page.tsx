import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
        101Discoveries
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
        Where curious kids discover more.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        Chess and math enrichment for K–8 students in Jersey City. Small classes,
        expert coaches, and a love of learning that lasts.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/classes"
          className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Browse classes
        </Link>
      </div>
    </main>
  );
}

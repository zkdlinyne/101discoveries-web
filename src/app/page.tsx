import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative flex flex-1 overflow-hidden">
      {/*
        Backdrop. Currently a soft brand gradient with decorative blobs. To use a
        real photo later, drop the file in /public (e.g. /public/hero.jpg) and
        replace this block with, for example:

          <Image src="/hero.jpg" alt="" fill priority
            className="object-cover" />
          <div className="absolute inset-0 bg-zinc-950/50" />  // readability scrim

        Keep the scrim so the white text stays legible on top of the image.
      */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-600 via-indigo-700 to-emerald-600" />
      <div className="absolute -left-24 -top-24 -z-10 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-16 -z-10 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />

      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-28 text-center sm:py-36">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
          101Discoveries · Jersey City
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white drop-shadow-sm sm:text-6xl">
          Where curious minds grow.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90">
          Small-group chess and math enrichment for K–8 students.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/classes/math" className={HERO_BUTTON}>
            Explore math classes
          </Link>
          <Link href="/classes/chess" className={HERO_BUTTON}>
            Explore chess classes
          </Link>
        </div>
      </div>
    </section>
  );
}

const HERO_BUTTON =
  "inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

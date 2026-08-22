import Image from "next/image";
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
      {/* Full-bleed photo backdrop. Swap /public/hero.png to change it. */}
      <Image
        src="/hero.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />
      {/*
        Readability scrim. The photo is bright and busy, so we darken it with a
        layered overlay (a top-to-bottom gradient plus a flat tint) to keep the
        white hero text legible. Adjust the opacities if it feels too dark/light.
      */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-zinc-950/70 via-zinc-950/55 to-zinc-950/75" />

      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-28 text-center sm:py-36">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
          101 Discoveries · Jersey City
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white drop-shadow-sm sm:text-6xl">
          Discover every day.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90">
          Small-group chess and math enrichment for K–8 students.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <HeroButton href="/classes/math" label="MATH" />
          <HeroButton href="/classes/chess" label="CHESS" />
        </div>
      </div>
    </section>
  );
}

function HeroButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={HERO_BUTTON}>
      <span>{label}</span>
      {/* Arrow slides in on hover to signal the button is clickable. */}
      <span
        aria-hidden="true"
        className="inline-block w-0 -translate-x-1 overflow-hidden opacity-0 transition-all duration-200 group-hover:w-4 group-hover:translate-x-0 group-hover:opacity-100"
      >
        →
      </span>
    </Link>
  );
}

const HERO_BUTTON =
  "group inline-flex items-center justify-center gap-1 rounded-full border border-white/70 px-8 py-3 text-sm font-semibold tracking-widest text-white transition-colors hover:bg-white hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

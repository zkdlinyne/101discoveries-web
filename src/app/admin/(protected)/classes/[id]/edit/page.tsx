import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAdminLocations,
  getAdminTerms,
  getClassForEdit,
} from "@/lib/admin";
import { ClassForm } from "../../ClassForm";
import type { ClassFormValues } from "../../form-state";
import { updateClassAction } from "./actions";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const klass = await getClassForEdit(id);
  return {
    title: klass
      ? `Edit ${klass.title} — 101Discoveries Admin`
      : "Edit class — 101Discoveries Admin",
  };
}

export default async function EditClassPage({ params }: PageProps) {
  const { id } = await params;
  const [klass, terms, locations] = await Promise.all([
    getClassForEdit(id),
    getAdminTerms(),
    getAdminLocations(),
  ]);

  if (!klass) notFound();

  const initialValues: ClassFormValues = {
    title: klass.title,
    category: klass.category,
    description: klass.description ?? "",
    term_id: klass.term_id ?? "",
    location_id: klass.location_id ?? "",
    day_of_week: klass.day_of_week ?? "",
    // Postgres `time` comes back as "HH:MM:SS"; the time input wants "HH:MM".
    start_time: (klass.start_time ?? "").slice(0, 5),
    end_time: (klass.end_time ?? "").slice(0, 5),
    grade_min: String(klass.grade_min),
    grade_max: String(klass.grade_max),
    price_dollars: String(klass.price_cents / 100),
    capacity: String(klass.capacity),
    is_published: klass.is_published,
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← All classes
      </Link>

      <h1 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Edit class
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Update details for {klass.title}.
      </p>

      <ClassForm
        terms={terms}
        locations={locations}
        action={updateClassAction}
        initialValues={initialValues}
        classId={klass.id}
        submitLabel="Save changes"
        pendingLabel="Saving…"
      />
    </main>
  );
}

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { AdminLocation, AdminTerm } from "@/lib/admin";
import { CATEGORY_OPTIONS, DAY_OPTIONS, GRADE_OPTIONS } from "@/lib/validation";
import type { ClassFormState, ClassFormValues } from "./form-state";

const initialState: ClassFormState = {};

const inputClass =
  "mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

type ClassFormAction = (
  state: ClassFormState,
  formData: FormData,
) => Promise<ClassFormState>;

export function ClassForm({
  terms,
  locations,
  action,
  initialValues,
  submitLabel,
  pendingLabel,
  classId,
  cancelHref = "/admin",
}: {
  terms: AdminTerm[];
  locations: AdminLocation[];
  action: ClassFormAction;
  initialValues: ClassFormValues;
  submitLabel: string;
  pendingLabel: string;
  classId?: string;
  cancelHref?: string;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const err = state.fieldErrors ?? {};
  const val = state.values ?? {};

  // Prefer the resubmitted value (on validation error) over the initial value.
  const field = (key: keyof ClassFormValues) =>
    val[key] ?? String(initialValues[key] ?? "");

  const publishedDefault =
    val.is_published !== undefined
      ? val.is_published === "on"
      : initialValues.is_published;

  return (
    <form action={formAction} className="mt-8 space-y-6">
      {classId && <input type="hidden" name="classId" value={classId} />}

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="title" className={labelClass}>
          Class name
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={field("title")}
          placeholder="Beginner Chess"
          className={inputClass}
        />
        {err.title && <FieldError>{err.title}</FieldError>}
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={field("description")}
          placeholder="Introductory chess class focused on rules, tactics, and sportsmanship."
          className={inputClass}
        />
        {err.description && <FieldError>{err.description}</FieldError>}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={field("category")}
            className={inputClass}
          >
            <option value="" disabled>
              Select…
            </option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {err.category && <FieldError>{err.category}</FieldError>}
        </div>

        <div>
          <label htmlFor="term_id" className={labelClass}>
            Semester
          </label>
          <select
            id="term_id"
            name="term_id"
            defaultValue={field("term_id")}
            className={inputClass}
          >
            <option value="">No semester</option>
            {terms.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {err.term_id && <FieldError>{err.term_id}</FieldError>}
        </div>

        <div>
          <label htmlFor="grade_min" className={labelClass}>
            Lowest grade
          </label>
          <select
            id="grade_min"
            name="grade_min"
            defaultValue={field("grade_min")}
            className={inputClass}
          >
            {GRADE_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
          {err.grade_min && <FieldError>{err.grade_min}</FieldError>}
        </div>

        <div>
          <label htmlFor="grade_max" className={labelClass}>
            Highest grade
          </label>
          <select
            id="grade_max"
            name="grade_max"
            defaultValue={field("grade_max")}
            className={inputClass}
          >
            {GRADE_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
          {err.grade_max && <FieldError>{err.grade_max}</FieldError>}
        </div>

        <div>
          <label htmlFor="price_dollars" className={labelClass}>
            Price (USD)
          </label>
          <input
            id="price_dollars"
            name="price_dollars"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={field("price_dollars")}
            placeholder="450"
            className={inputClass}
          />
          {err.price_dollars && <FieldError>{err.price_dollars}</FieldError>}
        </div>

        <div>
          <label htmlFor="capacity" className={labelClass}>
            Capacity
          </label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            step="1"
            required
            defaultValue={field("capacity")}
            placeholder="16"
            className={inputClass}
          />
          {err.capacity && <FieldError>{err.capacity}</FieldError>}
        </div>

        <div>
          <label htmlFor="location_id" className={labelClass}>
            Location
          </label>
          <select
            id="location_id"
            name="location_id"
            defaultValue={field("location_id")}
            className={inputClass}
          >
            <option value="">No location</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
                {l.city ? ` — ${l.city}` : ""}
              </option>
            ))}
          </select>
          {err.location_id && <FieldError>{err.location_id}</FieldError>}
        </div>

        <div>
          <label htmlFor="day_of_week" className={labelClass}>
            Day of week
          </label>
          <select
            id="day_of_week"
            name="day_of_week"
            defaultValue={field("day_of_week")}
            className={inputClass}
          >
            <option value="">No set day</option>
            {DAY_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {err.day_of_week && <FieldError>{err.day_of_week}</FieldError>}
        </div>

        <div>
          <label htmlFor="start_time" className={labelClass}>
            Start time
          </label>
          <input
            id="start_time"
            name="start_time"
            type="time"
            defaultValue={field("start_time")}
            className={inputClass}
          />
          {err.start_time && <FieldError>{err.start_time}</FieldError>}
        </div>

        <div>
          <label htmlFor="end_time" className={labelClass}>
            End time
          </label>
          <input
            id="end_time"
            name="end_time"
            type="time"
            defaultValue={field("end_time")}
            className={inputClass}
          />
          {err.end_time && <FieldError>{err.end_time}</FieldError>}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={publishedDefault}
          className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
        />
        Publish on the public catalog
      </label>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton submitLabel={submitLabel} pendingLabel={pendingLabel} />
        <Link
          href={cancelHref}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
      {children}
    </p>
  );
}

function SubmitButton({
  submitLabel,
  pendingLabel,
}: {
  submitLabel: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingLabel : submitLabel}
    </button>
  );
}

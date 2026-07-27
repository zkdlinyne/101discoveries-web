"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { createLocationAction, type LocationFormState } from "./actions";

const initialState: LocationFormState = {};

const inputClass =
  "mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export function LocationForm() {
  const [state, formAction] = useActionState(createLocationAction, initialState);
  const err = state.fieldErrors ?? {};
  const val = state.values ?? {};
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the form once a location is successfully added.
  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800"
    >
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Add a location
      </h2>

      {state.error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Location added.
        </p>
      )}

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={val.name}
            placeholder="101Discoveries Jersey City"
            className={inputClass}
          />
          {err.name && <FieldError>{err.name}</FieldError>}
        </div>

        <div>
          <label htmlFor="address" className={labelClass}>
            Address <span className="text-zinc-400">(optional)</span>
          </label>
          <input
            id="address"
            name="address"
            type="text"
            defaultValue={val.address}
            placeholder="123 Main St"
            className={inputClass}
          />
          {err.address && <FieldError>{err.address}</FieldError>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className={labelClass}>
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              defaultValue={val.city ?? "Jersey City"}
              className={inputClass}
            />
            {err.city && <FieldError>{err.city}</FieldError>}
          </div>
          <div>
            <label htmlFor="state" className={labelClass}>
              State
            </label>
            <input
              id="state"
              name="state"
              type="text"
              maxLength={2}
              defaultValue={val.state ?? "NJ"}
              className={inputClass}
            />
            {err.state && <FieldError>{err.state}</FieldError>}
          </div>
        </div>

        <SubmitButton />
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Adding…" : "Add location"}
    </button>
  );
}

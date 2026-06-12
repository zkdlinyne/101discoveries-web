"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerAction, type RegisterState } from "./actions";
import { GRADE_OPTIONS } from "@/lib/validation";

const initialState: RegisterState = {};

export function RegisterForm({ slug }: { slug: string }) {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="mt-10 space-y-10">
      <input type="hidden" name="slug" value={slug} />

      {state.formError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.formError}
        </p>
      )}

      <Fieldset legend="Parent / guardian">
        <Field
          label="First name"
          name="parent_first_name"
          errors={state.fieldErrors?.parent_first_name}
          required
        />
        <Field
          label="Last name"
          name="parent_last_name"
          errors={state.fieldErrors?.parent_last_name}
          required
        />
        <Field
          label="Email"
          name="parent_email"
          type="email"
          errors={state.fieldErrors?.parent_email}
          required
        />
        <Field
          label="Phone"
          name="parent_phone"
          type="tel"
          errors={state.fieldErrors?.parent_phone}
          required
        />
      </Fieldset>

      <Fieldset legend="Student">
        <Field
          label="First name"
          name="student_first_name"
          errors={state.fieldErrors?.student_first_name}
          required
        />
        <Field
          label="Last name"
          name="student_last_name"
          errors={state.fieldErrors?.student_last_name}
          required
        />
        <div className="sm:col-span-2">
          <label
            htmlFor="student_grade"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Grade <span className="text-red-500">*</span>
          </label>
          <select
            id="student_grade"
            name="student_grade"
            defaultValue=""
            required
            className="mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="" disabled>
              Select a grade
            </option>
            {GRADE_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.student_grade} />
        </div>
      </Fieldset>

      <Fieldset legend="Emergency contact (optional)">
        <Field
          label="Name"
          name="emergency_contact_name"
          errors={state.fieldErrors?.emergency_contact_name}
        />
        <Field
          label="Phone"
          name="emergency_contact_phone"
          type="tel"
          errors={state.fieldErrors?.emergency_contact_phone}
        />
      </Fieldset>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Submitting…" : "Continue to payment"}
    </button>
  );
}

function Fieldset({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {legend}
      </legend>
      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        {children}
      </div>
    </fieldset>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  errors,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  errors?: string[];
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <FieldError errors={errors} />
    </div>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors[0]}</p>
  );
}

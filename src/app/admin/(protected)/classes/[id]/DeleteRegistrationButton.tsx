"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  deleteRegistrationAction,
  type DeleteRegistrationState,
} from "./actions";

const initialState: DeleteRegistrationState = {};

export function DeleteRegistrationButton({
  registrationId,
  classId,
  studentName,
  isPaid,
}: {
  registrationId: string;
  classId: string;
  studentName: string;
  isPaid: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(
    deleteRegistrationAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Delete ${studentName}'s enrollment`}
        title={`Delete ${studentName}'s enrollment`}
        className="rounded-md p-1.5 text-zinc-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 group-hover:opacity-100 dark:hover:bg-red-950 dark:hover:text-red-400"
      >
        <TrashIcon />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900"
          >
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Delete enrollment?
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {`This removes ${studentName}'s registration from this class. This can't be undone.`}
            </p>

            {isPaid && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                Heads up: this enrollment is paid. Deleting it does not issue a
                refund — handle any refund in Stripe separately.
              </p>
            )}

            {state.error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                {state.error}
              </p>
            )}

            <form action={formAction} className="mt-6 flex justify-end gap-3">
              <input
                type="hidden"
                name="registrationId"
                value={registrationId}
              />
              <input type="hidden" name="classId" value={classId} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <DeleteSubmit />
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function DeleteSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete enrollment"}
    </button>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8.75 1a1 1 0 0 0-.96.71L7.42 3H4a1 1 0 0 0 0 2h.42l.84 11.11A2 2 0 0 0 7.25 18h5.5a2 2 0 0 0 1.99-1.89L15.58 5H16a1 1 0 1 0 0-2h-3.42l-.37-1.29A1 1 0 0 0 11.25 1h-2.5ZM9 7a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6A.75.75 0 0 1 9 7Zm2.75.75a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 1.5 0v-6Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

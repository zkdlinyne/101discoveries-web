import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Registration received — 101Discoveries",
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ rid?: string; session_id?: string }>;
};

type RegistrationSummary = {
  student_first_name: string;
  student_last_name: string;
  amount_cents: number;
  status: string;
  classes: { title: string } | { title: string }[] | null;
};

async function getRegistration(
  rid: string | undefined,
  sessionId: string | undefined,
): Promise<RegistrationSummary | null> {
  const supabase = createAdminClient();
  const select =
    "student_first_name, student_last_name, amount_cents, status, classes ( title )";

  const query = supabase.from("registrations").select(select);
  const { data } = sessionId
    ? await query.eq("stripe_checkout_session_id", sessionId).maybeSingle()
    : rid
      ? await query.eq("id", rid).maybeSingle()
      : { data: null };

  return (data as RegistrationSummary | null) ?? null;
}

// Ask Stripe directly whether the session was paid. This is accurate even
// before the (future) webhook flips the DB status.
async function getStripePaid(sessionId: string | undefined): Promise<boolean> {
  if (!sessionId) return false;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    return session.payment_status === "paid";
  } catch {
    return false;
  }
}

export default async function RegistrationSuccessPage({
  searchParams,
}: PageProps) {
  const { rid, session_id } = await searchParams;

  const [reg, stripePaid] = await Promise.all([
    getRegistration(rid, session_id),
    getStripePaid(session_id),
  ]);

  const isPaid = stripePaid || reg?.status === "paid";

  const classTitle = Array.isArray(reg?.classes)
    ? (reg?.classes[0]?.title ?? null)
    : (reg?.classes?.title ?? null);

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-16 sm:py-24">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
        <span className="text-2xl text-emerald-600 dark:text-emerald-400">
          ✓
        </span>
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {isPaid ? "Payment received" : "Registration received"}
      </h1>

      <p className="mt-3 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        {reg
          ? `Thanks! We've saved ${reg.student_first_name}'s spot${classTitle ? ` for ${classTitle}` : ""}.`
          : "Thanks! We've received your registration."}
      </p>

      {reg && (
        <dl className="mt-8 space-y-3 rounded-2xl border border-zinc-200 p-6 text-sm dark:border-zinc-800">
          <Row label="Student">
            {reg.student_first_name} {reg.student_last_name}
          </Row>
          {classTitle && <Row label="Class">{classTitle}</Row>}
          <Row label="Tuition">{formatPrice(reg.amount_cents)}</Row>
          <Row label="Payment">
            {isPaid ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Paid
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                Pending payment
              </span>
            )}
          </Row>
        </dl>
      )}

      <p className="mt-8 rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
        {isPaid
          ? "Your payment was successful. Enrollment is being finalized — automated confirmation is coming in the next step."
          : "Your spot is held as pending payment. If you didn't complete checkout, you can register again from the class page."}
      </p>

      <div className="mt-10">
        <Link
          href="/classes"
          className="inline-flex items-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
        >
          Back to catalog
        </Link>
      </div>
    </main>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="font-medium text-zinc-900 dark:text-zinc-100">
        {children}
      </dd>
    </div>
  );
}

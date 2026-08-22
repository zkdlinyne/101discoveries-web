import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getClassRoster, type RosterRow } from "@/lib/admin";
import { formatGradeRange, formatPrice } from "@/lib/format";
import { DeleteRegistrationButton } from "./DeleteRegistrationButton";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const roster = await getClassRoster(id);
  return {
    title: roster
      ? `${roster.title} roster — 101 Discoveries Admin`
      : "Roster — 101 Discoveries Admin",
  };
}

export default async function ClassRosterPage({ params }: PageProps) {
  const { id } = await params;
  const roster = await getClassRoster(id);

  if (!roster) notFound();

  const paidCount = roster.rows.filter((r) => r.status === "paid").length;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← All classes
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {roster.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {roster.termName ? `${roster.termName} · ` : ""}
            {roster.rows.length} registrations · {paidCount} paid ·{" "}
            {roster.capacity} capacity
          </p>
        </div>
        {roster.rows.length > 0 && (
          <a
            href={`/admin/classes/${roster.id}/export`}
            className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Export CSV
          </a>
        )}
      </div>

      {roster.rows.length === 0 ? (
        <p className="mt-10 text-sm text-zinc-500">No registrations yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Grade</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {roster.rows.map((r) => (
                <RosterTableRow key={r.id} r={r} classId={roster.id} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function RosterTableRow({ r, classId }: { r: RosterRow; classId: string }) {
  return (
    <tr className="group bg-white dark:bg-zinc-950">
      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
        {r.student_first_name} {r.student_last_name}
      </td>
      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
        {formatGradeRange(r.student_grade, r.student_grade)}
      </td>
      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
        <div>{r.parent_email}</div>
        {r.parent_phone && <div className="text-xs">{r.parent_phone}</div>}
      </td>
      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
        {formatPrice(r.amount_cents)}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={r.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <DeleteRegistrationButton
          registrationId={r.id}
          classId={classId}
          studentName={`${r.student_first_name} ${r.student_last_name}`}
          isPaid={r.status === "paid"}
        />
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: RosterRow["status"] }) {
  const styles: Record<RosterRow["status"], string> = {
    paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    pending_payment:
      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    waitlisted:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    cancelled: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
    refunded: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  };
  const label: Record<RosterRow["status"], string> = {
    paid: "Paid",
    pending_payment: "Pending",
    waitlisted: "Waitlisted",
    cancelled: "Cancelled",
    refunded: "Refunded",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {label[status]}
    </span>
  );
}

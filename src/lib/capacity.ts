import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

// How long a pending (mid-checkout) registration holds a seat before it's
// treated as abandoned and the seat is released back to the pool. Paid seats
// always count; pending seats only count while they're within this window.
// This is what lets an abandoned Stripe Checkout free up its seat without us
// having to reconcile expired sessions.
export const SEAT_HOLD_MINUTES = 30;

export type SeatInfo = {
  capacity: number;
  taken: number;
  seatsLeft: number;
  isFull: boolean;
};

function holdCutoffIso(): string {
  return new Date(Date.now() - SEAT_HOLD_MINUTES * 60_000).toISOString();
}

// Seats counted toward capacity: everyone who's paid, plus anyone currently
// mid-checkout (pending within the hold window). Used to gate new registrations
// before we ever create a Stripe Checkout session.
export async function getSeatsTaken(classId: string): Promise<number> {
  const supabase = createAdminClient();
  const cutoff = holdCutoffIso();

  const [paid, pending] = await Promise.all([
    supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("class_id", classId)
      .eq("status", "paid"),
    supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("class_id", classId)
      .eq("status", "pending_payment")
      .gte("created_at", cutoff),
  ]);

  if (paid.error) {
    throw new Error(`Failed to count paid seats: ${paid.error.message}`);
  }
  if (pending.error) {
    throw new Error(`Failed to count pending seats: ${pending.error.message}`);
  }

  return (paid.count ?? 0) + (pending.count ?? 0);
}

// Convenience wrapper returning capacity + remaining seats for a class. Used by
// the register page to decide whether to show the form or a "full" notice.
export async function getSeatInfo(
  classId: string,
  capacity: number,
): Promise<SeatInfo> {
  const taken = await getSeatsTaken(classId);
  const seatsLeft = Math.max(0, capacity - taken);
  return { capacity, taken, seatsLeft, isFull: seatsLeft <= 0 };
}

// Keeps a class's public status in sync with paid enrollment: flips 'open' ->
// 'full' once paid registrations reach capacity, and 'full' -> 'open' if a paid
// seat is later removed. Only toggles between those two states so admin-set
// statuses (draft/closed/waitlist) are never overwritten.
export async function syncClassFullStatus(classId: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: klass, error: classErr } = await supabase
    .from("classes")
    .select("status, capacity")
    .eq("id", classId)
    .maybeSingle();

  if (classErr) {
    throw new Error(`Failed to load class for status sync: ${classErr.message}`);
  }
  if (!klass) return;

  const status = klass.status as string;
  if (status !== "open" && status !== "full") return;

  const { count, error: countErr } = await supabase
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .eq("class_id", classId)
    .eq("status", "paid");

  if (countErr) {
    throw new Error(`Failed to count paid seats: ${countErr.message}`);
  }

  const paid = count ?? 0;
  const capacity = klass.capacity as number;
  const nextStatus = paid >= capacity ? "full" : "open";

  if (nextStatus !== status) {
    await supabase
      .from("classes")
      .update({ status: nextStatus })
      .eq("id", classId);
  }
}

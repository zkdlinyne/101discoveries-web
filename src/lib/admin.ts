import { createAdminClient } from "@/lib/supabase/admin";

export type RegistrationStatus =
  | "pending_payment"
  | "paid"
  | "waitlisted"
  | "cancelled"
  | "refunded";

export type ClassSummary = {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  capacity: number;
  termName: string | null;
  counts: {
    paid: number;
    pending: number;
    waitlisted: number;
    cancelled: number;
    refunded: number;
    // Spots taken toward capacity (paid + pending).
    enrolled: number;
  };
};

export type RosterRow = {
  id: string;
  created_at: string;
  student_first_name: string;
  student_last_name: string;
  student_grade: number;
  parent_first_name: string;
  parent_last_name: string;
  parent_email: string;
  parent_phone: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  amount_cents: number;
  status: RegistrationStatus;
  paid_at: string | null;
};

export type ClassRoster = {
  id: string;
  title: string;
  slug: string;
  capacity: number;
  termName: string | null;
  rows: RosterRow[];
};

function emptyCounts(): ClassSummary["counts"] {
  return {
    paid: 0,
    pending: 0,
    waitlisted: 0,
    cancelled: 0,
    refunded: 0,
    enrolled: 0,
  };
}

function firstTerm(term: unknown): { name: string } | null {
  return Array.isArray(term) ? (term[0] ?? null) : ((term as { name: string }) ?? null);
}

export type AdminTerm = {
  id: string;
  name: string;
  school_year: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

// Terms for the "semester" dropdown and the Semesters management page.
export async function getAdminTerms(): Promise<AdminTerm[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("terms")
    .select("id, name, school_year, start_date, end_date, is_active")
    .order("start_date", { ascending: false });

  if (error) throw new Error(`Failed to load terms: ${error.message}`);
  return (data ?? []) as AdminTerm[];
}

export type AdminLocation = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
};

// Locations for the location dropdown and the Locations management page.
export async function getAdminLocations(): Promise<AdminLocation[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("locations")
    .select("id, name, address, city, state")
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to load locations: ${error.message}`);
  return (data ?? []) as AdminLocation[];
}

// Overview: every class (including drafts/unpublished, since this is admin)
// with registration counts by status. Reads via the service_role admin client.
export async function getAdminClassSummaries(): Promise<ClassSummary[]> {
  const supabase = createAdminClient();

  const [{ data: classes, error: classErr }, { data: regs, error: regErr }] =
    await Promise.all([
      supabase
        .from("classes")
        .select("id, title, slug, category, status, capacity, term:terms ( name )")
        .order("display_order", { ascending: true }),
      supabase.from("registrations").select("class_id, status"),
    ]);

  if (classErr) throw new Error(`Failed to load classes: ${classErr.message}`);
  if (regErr) throw new Error(`Failed to load registrations: ${regErr.message}`);

  const countsByClass = new Map<string, ClassSummary["counts"]>();
  for (const r of regs ?? []) {
    const row = r as { class_id: string; status: RegistrationStatus };
    const c = countsByClass.get(row.class_id) ?? emptyCounts();
    switch (row.status) {
      case "paid":
        c.paid++;
        c.enrolled++;
        break;
      case "pending_payment":
        c.pending++;
        c.enrolled++;
        break;
      case "waitlisted":
        c.waitlisted++;
        break;
      case "cancelled":
        c.cancelled++;
        break;
      case "refunded":
        c.refunded++;
        break;
    }
    countsByClass.set(row.class_id, c);
  }

  return (classes ?? []).map((row) => {
    const c = row as Record<string, unknown>;
    return {
      id: c.id as string,
      title: c.title as string,
      slug: c.slug as string,
      category: c.category as string,
      status: c.status as string,
      capacity: c.capacity as number,
      termName: firstTerm(c.term)?.name ?? null,
      counts: countsByClass.get(c.id as string) ?? emptyCounts(),
    };
  });
}

// Full roster for a single class. Returns null if the class doesn't exist.
export async function getClassRoster(
  classId: string,
): Promise<ClassRoster | null> {
  const supabase = createAdminClient();

  const { data: klass, error: classErr } = await supabase
    .from("classes")
    .select("id, title, slug, capacity, term:terms ( name )")
    .eq("id", classId)
    .maybeSingle();

  if (classErr) throw new Error(`Failed to load class: ${classErr.message}`);
  if (!klass) return null;

  const { data: rows, error: rowsErr } = await supabase
    .from("registrations")
    .select(
      "id, created_at, student_first_name, student_last_name, student_grade, parent_first_name, parent_last_name, parent_email, parent_phone, emergency_contact_name, emergency_contact_phone, amount_cents, status, paid_at",
    )
    .eq("class_id", classId)
    .order("created_at", { ascending: true });

  if (rowsErr) throw new Error(`Failed to load roster: ${rowsErr.message}`);

  const k = klass as Record<string, unknown>;
  return {
    id: k.id as string,
    title: k.title as string,
    slug: k.slug as string,
    capacity: k.capacity as number,
    termName: firstTerm(k.term)?.name ?? null,
    rows: (rows ?? []) as RosterRow[],
  };
}

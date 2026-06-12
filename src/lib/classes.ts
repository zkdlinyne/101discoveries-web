import { createClient } from "@/lib/supabase/server";

export type CatalogClass = {
  id: string;
  title: string;
  slug: string;
  category: "chess" | "math";
  description: string | null;
  grade_min: number;
  grade_max: number;
  day_of_week: string | null;
  start_time: string | null;
  end_time: string | null;
  price_cents: number;
  capacity: number;
  status: "draft" | "open" | "full" | "waitlist" | "closed";
  term: { name: string; school_year: string } | null;
  location: { name: string; city: string; state: string } | null;
};

// Reads published classes for the public catalog. Relies on RLS: only
// `is_published = true` rows are returned to the anon/public client.
export async function getPublishedClasses(): Promise<CatalogClass[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("classes")
    .select(
      `
        id,
        title,
        slug,
        category,
        description,
        grade_min,
        grade_max,
        day_of_week,
        start_time,
        end_time,
        price_cents,
        capacity,
        status,
        term:terms ( name, school_year ),
        location:locations ( name, city, state )
      `,
    )
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to load classes: ${error.message}`);
  }

  // Supabase types many-to-one embeds as arrays; at runtime they're single
  // objects (or null), so normalize the shape here.
  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      ...(r as object),
      term: Array.isArray(r.term) ? (r.term[0] ?? null) : (r.term ?? null),
      location: Array.isArray(r.location)
        ? (r.location[0] ?? null)
        : (r.location ?? null),
    } as CatalogClass;
  });
}

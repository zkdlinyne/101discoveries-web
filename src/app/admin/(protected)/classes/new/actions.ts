"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/admin-auth";
import { classInputSchema } from "@/lib/validation";

export type NewClassState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Ensure the slug is unique by appending -2, -3, ... on collision.
async function uniqueSlug(
  supabase: ReturnType<typeof createAdminClient>,
  base: string,
): Promise<string> {
  const root = base || "class";
  let candidate = root;
  let n = 1;

  // Loop until we find a slug not already taken.
  for (;;) {
    const { data, error } = await supabase
      .from("classes")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) throw new Error(`Failed to check slug: ${error.message}`);
    if (!data) return candidate;

    n += 1;
    candidate = `${root}-${n}`;
  }
}

export async function createClassAction(
  _prevState: NewClassState,
  formData: FormData,
): Promise<NewClassState> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  const raw = {
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
    term_id: formData.get("term_id"),
    location_id: formData.get("location_id"),
    day_of_week: formData.get("day_of_week"),
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
    grade_min: formData.get("grade_min"),
    grade_max: formData.get("grade_max"),
    price_dollars: formData.get("price_dollars"),
    capacity: formData.get("capacity"),
    is_published: formData.get("is_published") === "on",
  };

  const parsed = classInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors,
      values: {
        title: String(raw.title ?? ""),
        category: String(raw.category ?? ""),
        description: String(raw.description ?? ""),
        term_id: String(raw.term_id ?? ""),
        location_id: String(raw.location_id ?? ""),
        day_of_week: String(raw.day_of_week ?? ""),
        start_time: String(raw.start_time ?? ""),
        end_time: String(raw.end_time ?? ""),
        grade_min: String(raw.grade_min ?? ""),
        grade_max: String(raw.grade_max ?? ""),
        price_dollars: String(raw.price_dollars ?? ""),
        capacity: String(raw.capacity ?? ""),
      },
    };
  }

  const input = parsed.data;
  const supabase = createAdminClient();
  const slug = await uniqueSlug(supabase, slugify(input.title));

  const { error } = await supabase.from("classes").insert({
    title: input.title,
    slug,
    category: input.category,
    description: input.description,
    term_id: input.term_id,
    location_id: input.location_id,
    day_of_week: input.day_of_week,
    start_time: input.start_time,
    end_time: input.end_time,
    grade_min: input.grade_min,
    grade_max: input.grade_max,
    price_cents: Math.round(input.price_dollars * 100),
    capacity: input.capacity,
    is_published: input.is_published,
    status: "open",
  });

  if (error) {
    return { error: `Could not create class: ${error.message}` };
  }

  revalidatePath("/admin");
  redirect("/admin");
}

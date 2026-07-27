"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/admin-auth";
import type { ClassFormState } from "../form-state";
import { parseClassForm } from "../parse";

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
  _prevState: ClassFormState,
  formData: FormData,
): Promise<ClassFormState> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  const result = parseClassForm(formData);
  if (!result.ok) return result.state;

  const input = result.data;
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

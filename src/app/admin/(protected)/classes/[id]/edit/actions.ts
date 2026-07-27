"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/admin-auth";
import type { ClassFormState } from "../../form-state";
import { parseClassForm } from "../../parse";

export async function updateClassAction(
  _prevState: ClassFormState,
  formData: FormData,
): Promise<ClassFormState> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  const classId = String(formData.get("classId") ?? "");
  if (!classId) return { error: "Missing class id." };

  const result = parseClassForm(formData);
  if (!result.ok) return result.state;

  const input = result.data;
  const supabase = createAdminClient();

  // Slug is intentionally left unchanged so existing links/bookmarks keep working.
  const { error } = await supabase
    .from("classes")
    .update({
      title: input.title,
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
    })
    .eq("id", classId);

  if (error) {
    return { error: `Could not update class: ${error.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/"); // public catalog
  revalidatePath("/classes/[slug]", "page"); // public class detail pages
  redirect("/admin");
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/admin-auth";
import { termInputSchema } from "@/lib/validation";

export type TermFormState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

// "2026-2027" for a fall→spring term, or just "2026" when it stays in one year.
function deriveSchoolYear(startDate: string, endDate: string): string {
  const startYear = startDate.slice(0, 4);
  const endYear = endDate.slice(0, 4);
  return startYear === endYear ? startYear : `${startYear}-${endYear}`;
}

export async function createTermAction(
  _prevState: TermFormState,
  formData: FormData,
): Promise<TermFormState> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  const raw = {
    name: formData.get("name"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    is_active: formData.get("is_active") === "on",
  };

  const parsed = termInputSchema.safeParse(raw);
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
        name: String(raw.name ?? ""),
        start_date: String(raw.start_date ?? ""),
        end_date: String(raw.end_date ?? ""),
      },
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("terms").insert({
    ...parsed.data,
    // school_year is NOT NULL in the DB; derive it from the dates so the founder
    // doesn't have to type it (it's already implied by the semester name).
    school_year: deriveSchoolYear(parsed.data.start_date, parsed.data.end_date),
  });

  if (error) {
    return { error: `Could not create semester: ${error.message}` };
  }

  revalidatePath("/admin/semesters");
  revalidatePath("/admin/classes/new");
  return { success: true };
}

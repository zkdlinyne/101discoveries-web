import { classInputSchema, type ClassInput } from "@/lib/validation";
import type { ClassFormState } from "./form-state";

// Turn the class form's FormData into a validated ClassInput, or a form state
// carrying field errors and the resubmitted values. Shared by create + edit.
export function parseClassForm(
  formData: FormData,
):
  | { ok: true; data: ClassInput }
  | { ok: false; state: ClassFormState } {
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
  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }

  const fieldErrors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }

  return {
    ok: false,
    state: {
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
        is_published: raw.is_published ? "on" : "",
      },
    },
  };
}

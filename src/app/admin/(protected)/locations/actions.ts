"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/admin-auth";
import { locationInputSchema } from "@/lib/validation";

export type LocationFormState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

export async function createLocationAction(
  _prevState: LocationFormState,
  formData: FormData,
): Promise<LocationFormState> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  const raw = {
    name: formData.get("name"),
    address: formData.get("address"),
    city: formData.get("city"),
    state: formData.get("state"),
  };

  const parsed = locationInputSchema.safeParse(raw);
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
        address: String(raw.address ?? ""),
        city: String(raw.city ?? ""),
        state: String(raw.state ?? ""),
      },
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("locations").insert(parsed.data);

  if (error) {
    return { error: `Could not create location: ${error.message}` };
  }

  // Refresh the list here and the class form's dropdown.
  revalidatePath("/admin/locations");
  revalidatePath("/admin/classes/new");
  return { success: true };
}

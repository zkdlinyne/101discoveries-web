"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/admin-auth";

export type DeleteClassState = { error?: string; success?: boolean };

export async function deleteClassAction(
  _prevState: DeleteClassState,
  formData: FormData,
): Promise<DeleteClassState> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  const classId = String(formData.get("classId") ?? "");
  if (!classId) return { error: "Missing class id." };

  const supabase = createAdminClient();

  // Guard: never delete a class that already has registrations. Besides
  // protecting paid enrollment records, the FK would reject the delete anyway.
  const { count, error: countErr } = await supabase
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .eq("class_id", classId);

  if (countErr) {
    return { error: `Could not check registrations: ${countErr.message}` };
  }
  if ((count ?? 0) > 0) {
    return {
      error: `This class has ${count} registration${
        count === 1 ? "" : "s"
      } and can't be deleted.`,
    };
  }

  const { error } = await supabase.from("classes").delete().eq("id", classId);
  if (error) {
    return { error: `Could not delete class: ${error.message}` };
  }

  revalidatePath("/admin");
  return { success: true };
}

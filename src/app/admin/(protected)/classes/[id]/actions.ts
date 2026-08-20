"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/admin-auth";
import { syncClassFullStatus } from "@/lib/capacity";

export type DeleteRegistrationState = { error?: string; success?: boolean };

// Deletes a single registration (enrollment). This does NOT issue a refund —
// refunds are handled separately in Stripe. Guarded by the admin allowlist.
export async function deleteRegistrationAction(
  _prevState: DeleteRegistrationState,
  formData: FormData,
): Promise<DeleteRegistrationState> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  const registrationId = String(formData.get("registrationId") ?? "");
  const classId = String(formData.get("classId") ?? "");
  if (!registrationId) return { error: "Missing registration id." };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("registrations")
    .delete()
    .eq("id", registrationId);

  if (error) {
    return { error: `Could not delete enrollment: ${error.message}` };
  }

  // Removing an enrollment may free a seat, so re-open a class that was full.
  if (classId) {
    await syncClassFullStatus(classId);
    revalidatePath(`/admin/classes/${classId}`);
  }
  revalidatePath("/admin");
  return { success: true };
}

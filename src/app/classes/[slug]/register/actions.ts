"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClassBySlug } from "@/lib/classes";
import { registrationSchema } from "@/lib/validation";

export type RegisterState = {
  fieldErrors?: Record<string, string[]>;
  formError?: string;
};

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registrationSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const input = parsed.data;

  // Re-fetch the class server-side: never trust the price (or that the class
  // is open) from the submitted form.
  const klass = await getClassBySlug(input.slug);
  if (!klass) {
    return { formError: "This class is no longer available." };
  }
  if (klass.status === "draft" || klass.status === "closed") {
    return { formError: "Registration for this class is closed." };
  }

  const supabase = createAdminClient();
  const { data: inserted, error } = await supabase
    .from("registrations")
    .insert({
      class_id: klass.id,
      parent_first_name: input.parent_first_name,
      parent_last_name: input.parent_last_name,
      parent_email: input.parent_email,
      parent_phone: input.parent_phone,
      student_first_name: input.student_first_name,
      student_last_name: input.student_last_name,
      student_grade: input.student_grade,
      emergency_contact_name: input.emergency_contact_name || null,
      emergency_contact_phone: input.emergency_contact_phone || null,
      amount_cents: klass.price_cents,
      status: "pending_payment",
    })
    .select("id")
    .single();

  if (error) {
    return {
      formError: `We couldn't save your registration. Please try again. (${error.message})`,
    };
  }

  // redirect() throws, so it must live outside any try/catch.
  redirect(`/classes/${input.slug}/register/success?rid=${inserted.id}`);
}

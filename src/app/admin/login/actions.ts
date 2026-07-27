"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin-auth";

export type LoginState = { error?: string };

export async function signInAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Invalid email or password." };
  }

  // Even with valid credentials, only allowlisted emails may enter /admin.
  if (!isAdminEmail(email)) {
    await supabase.auth.signOut();
    return { error: "This account isn't authorized for admin access." };
  }

  redirect("/admin");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

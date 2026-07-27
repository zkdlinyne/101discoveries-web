import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Emails allowed into the admin dashboard. Kept in an env var so access can be
// changed without a deploy of code.
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

// Returns the signed-in user only if they're on the admin allowlist; otherwise
// null. Uses getUser() (verified against Supabase) rather than getSession().
export async function getAdminUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}

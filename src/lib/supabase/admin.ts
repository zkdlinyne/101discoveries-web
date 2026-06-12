import "server-only";
import { createClient } from "@supabase/supabase-js";

// Admin client backed by the service_role key. It BYPASSES Row Level Security,
// so it must only ever run on the server (Route Handlers, Server Actions,
// the Stripe webhook). The `server-only` import above makes the build fail
// if this module is ever imported into client code.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

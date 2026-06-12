-- Privileges for the service_role (used server-side via the admin client).
--
-- IMPORTANT: service_role bypasses RLS, but it does NOT bypass table GRANTs.
-- It still needs explicit table privileges. Supabase usually grants these
-- automatically via default privileges, but this project doesn't have those
-- defaults applying (same reason anon needed grants in 0001/0003), so we grant
-- them here.
--
-- service_role gets full access to the app tables. It only ever runs on the
-- server (registration writes, the Stripe webhook, the admin dashboard), so
-- this is the intended Supabase design — the secret key never reaches browsers.

grant all on table terms         to service_role;
grant all on table locations     to service_role;
grant all on table classes       to service_role;
grant all on table registrations to service_role;

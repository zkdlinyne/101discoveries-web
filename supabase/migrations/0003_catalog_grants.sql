-- Table privileges for the API roles.
--
-- RLS policies decide WHICH rows a role can see, but a role must also hold the
-- base table privilege (SELECT) to query the table at all. Without this grant
-- the anon/public client gets "permission denied for table ...".
--
-- Only read access is granted, and only on the public catalog tables.
-- `registrations` is intentionally excluded: it stays writable only via the
-- service_role key (which bypasses both grants and RLS).

grant usage on schema public to anon, authenticated;

grant select on table terms     to anon, authenticated;
grant select on table locations to anon, authenticated;
grant select on table classes   to anon, authenticated;

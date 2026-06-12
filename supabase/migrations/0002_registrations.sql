-- Registrations: one denormalized row per student enrolled in a class.
-- Writes happen server-side with the service_role key (which bypasses RLS),
-- so there are intentionally NO anon policies here: the public client can
-- neither read nor write this table. This keeps parent/student PII private.

create table registrations (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id),

  -- Parent / guardian
  parent_first_name text not null,
  parent_last_name  text not null,
  parent_email      text not null,
  parent_phone      text,

  -- Student
  student_first_name text not null,
  student_last_name  text not null,
  student_grade      int  not null,

  -- Emergency contact
  emergency_contact_name  text,
  emergency_contact_phone text,

  -- Enrollment + payment status (flipped to 'paid' by the Stripe webhook)
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'waitlisted', 'cancelled', 'refunded')),
  amount_cents int not null,

  -- Stripe references
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id   text,

  notes      text,
  paid_at    timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index registrations_class_id_idx on registrations (class_id);
create index registrations_status_idx   on registrations (status);
create index registrations_parent_email_idx on registrations (parent_email);

-- Lock the table down. With no policies, the anon key has zero access;
-- only the service_role key (used server-side) can read/write.
alter table registrations enable row level security;

-- Keep updated_at fresh on any row change (also reusable for other tables).
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger registrations_set_updated_at
  before update on registrations
  for each row
  execute function set_updated_at();

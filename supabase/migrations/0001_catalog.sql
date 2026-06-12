-- Catalog schema: the public-facing class listing data.
-- terms (school sessions) -> classes; locations -> classes.
-- All three are publicly readable (catalog pages) via the RLS policies below.

create table terms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  school_year text not null,
  start_date date not null,
  end_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text not null default 'Jersey City',
  state text not null default 'NJ',
  created_at timestamptz not null default now()
);

create table classes (
  id uuid primary key default gen_random_uuid(),
  term_id uuid references terms(id),
  location_id uuid references locations(id),

  title text not null,
  slug text unique not null,
  category text not null check (category in ('chess', 'math')),
  description text,

  grade_min int not null,
  grade_max int not null,

  day_of_week text,
  start_time time,
  end_time time,

  price_cents int not null,
  capacity int not null,

  status text not null default 'open'
    check (status in ('draft', 'open', 'full', 'waitlist', 'closed')),

  stripe_price_id text,
  is_published boolean not null default false,
  display_order int not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Public read access for the catalog (anon key respects these policies).
alter table terms enable row level security;
alter table locations enable row level security;
alter table classes enable row level security;

create policy "Anyone can view active terms"
on terms
for select
using (is_active = true);

create policy "Anyone can view locations"
on locations
for select
using (true);

create policy "Anyone can view published classes"
on classes
for select
using (is_published = true);

-- Seed data: Fall 2026 term, Jersey City location, one sample class.
insert into terms (name, school_year, start_date, end_date)
values ('Fall 2026', '2026-2027', '2026-09-15', '2026-12-15');

insert into locations (name, address)
values ('101Discoveries Jersey City', 'TBD');

insert into classes (
  term_id,
  location_id,
  title,
  slug,
  category,
  description,
  grade_min,
  grade_max,
  day_of_week,
  start_time,
  end_time,
  price_cents,
  capacity,
  status,
  is_published,
  display_order
)
select
  t.id,
  l.id,
  'Beginner Chess',
  'beginner-chess-k-2-fall-2026',
  'chess',
  'Introductory chess class focused on rules, tactics, and sportsmanship.',
  0,
  2,
  'Tuesday',
  '16:00',
  '17:00',
  45000,
  16,
  'open',
  true,
  1
from terms t, locations l
where t.name = 'Fall 2026'
  and l.name = '101Discoveries Jersey City';

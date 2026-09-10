-- ============================================================
-- Waypoint Health — Supabase schema
-- Paste this whole file into: Supabase Dashboard -> SQL Editor -> New query
-- Then click "Run". Safe to re-run: uses IF NOT EXISTS / OR REPLACE.
-- ============================================================

create extension if not exists pg_trgm;
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- Core tables
-- ------------------------------------------------------------

create table if not exists countries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references countries(id) on delete cascade,
  name text not null,
  slug text not null,
  unique (country_id, slug)
);

create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  city_id uuid not null references cities(id) on delete restrict,
  website_url text,
  contact_url text,
  description text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists treatments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  category text
);

create table if not exists provider_treatments (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  treatment_id uuid not null references treatments(id) on delete cascade,
  price_min numeric,
  price_max numeric,
  currency text not null default 'USD',
  source_url text,
  source_name text,
  date_collected date,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  unique (provider_id, treatment_id)
);

-- Indexes that matter at this scale
create index if not exists providers_city_idx on providers (city_id);
create index if not exists providers_name_trgm_idx on providers using gin (name gin_trgm_ops);
create index if not exists treatments_name_trgm_idx on treatments using gin (name gin_trgm_ops);
create index if not exists provider_treatments_provider_idx on provider_treatments (provider_id);
create index if not exists provider_treatments_treatment_idx on provider_treatments (treatment_id);

-- ------------------------------------------------------------
-- Public read-only view used by the website
-- Joins everything the search/results page needs into one row.
-- ------------------------------------------------------------

create or replace view listings as
select
  pt.id                as listing_id,
  p.id                  as provider_id,
  p.name                as provider_name,
  p.slug                as provider_slug,
  p.description         as description,
  p.website_url         as website_url,
  p.contact_url         as contact_url,
  t.id                  as treatment_id,
  t.name                as treatment_name,
  t.slug                as treatment_slug,
  ci.name                as city_name,
  ci.slug                as city_slug,
  co.name                as country_name,
  co.slug                as country_slug,
  pt.price_min          as price_min,
  pt.price_max          as price_max,
  pt.currency            as currency,
  pt.source_url          as source_url,
  pt.source_name         as source_name,
  pt.date_collected      as date_collected,
  pt.verified             as verified
from provider_treatments pt
join providers p  on p.id = pt.provider_id and p.status = 'published'
join treatments t on t.id = pt.treatment_id
join cities ci    on ci.id = p.city_id
join countries co on co.id = ci.country_id
where pt.verified = true;

-- Make the view respect the querying user's RLS (anon key), not the
-- view owner's permissions.
alter view listings set (security_invoker = true);

-- ------------------------------------------------------------
-- Row Level Security: the site only ever uses the public "anon" key,
-- so we lock every table down to read-only, and only expose rows
-- that are published/verified. Draft data stays invisible to the
-- public site until you flip status/verified to true.
-- ------------------------------------------------------------

alter table countries enable row level security;
alter table cities enable row level security;
alter table providers enable row level security;
alter table treatments enable row level security;
alter table provider_treatments enable row level security;

drop policy if exists "public read countries" on countries;
create policy "public read countries" on countries for select using (true);

drop policy if exists "public read cities" on cities;
create policy "public read cities" on cities for select using (true);

drop policy if exists "public read treatments" on treatments;
create policy "public read treatments" on treatments for select using (true);

drop policy if exists "public read published providers" on providers;
create policy "public read published providers" on providers for select using (status = 'published');

drop policy if exists "public read verified provider_treatments" on provider_treatments;
create policy "public read verified provider_treatments" on provider_treatments for select using (verified = true);

-- No insert/update/delete policies are defined for the anon role, so the
-- public website can never write to the database. Do all data entry from
-- the Supabase Table Editor (logged in as you), or later via a service-role
-- key in a private import script — never from the browser.

-- ============================================================
-- SAMPLE / PLACEHOLDER DATA
-- ------------------------------------------------------------
-- Everything below is FAKE example data so you can see the site working
-- end to end immediately after running this file. The clinic names,
-- prices and URLs are invented placeholders, not real providers.
--
-- Before you launch, delete this sample data (see the DELETE statements
-- at the very bottom, commented out) and replace it with real information
-- you have actually verified from public provider websites.
-- ============================================================

insert into countries (name, slug) values
  ('Turkey', 'turkey'),
  ('Mexico', 'mexico'),
  ('Thailand', 'thailand')
on conflict (name) do nothing;

insert into cities (country_id, name, slug)
select id, 'Istanbul', 'istanbul' from countries where slug = 'turkey'
on conflict (country_id, slug) do nothing;

insert into cities (country_id, name, slug)
select id, 'Antalya', 'antalya' from countries where slug = 'turkey'
on conflict (country_id, slug) do nothing;

insert into cities (country_id, name, slug)
select id, 'Cancun', 'cancun' from countries where slug = 'mexico'
on conflict (country_id, slug) do nothing;

insert into cities (country_id, name, slug)
select id, 'Bangkok', 'bangkok' from countries where slug = 'thailand'
on conflict (country_id, slug) do nothing;

insert into treatments (name, slug, category) values
  ('Dental Implants', 'dental-implants', 'Dental'),
  ('Hair Transplant', 'hair-transplant', 'Cosmetic'),
  ('Knee Replacement', 'knee-replacement', 'Orthopedic')
on conflict (name) do nothing;

insert into providers (name, slug, city_id, website_url, contact_url, description, status)
select
  'Example Bosphorus Dental Clinic (SAMPLE)',
  'example-bosphorus-dental-clinic',
  ci.id,
  'https://example.com/bosphorus-dental',
  'https://example.com/bosphorus-dental/contact',
  'Placeholder listing used to demo the site. Replace with a real, verified clinic before launch.',
  'published'
from cities ci join countries co on co.id = ci.country_id
where ci.slug = 'istanbul' and co.slug = 'turkey'
on conflict (slug) do nothing;

insert into providers (name, slug, city_id, website_url, contact_url, description, status)
select
  'Example Antalya Smile Center (SAMPLE)',
  'example-antalya-smile-center',
  ci.id,
  'https://example.com/antalya-smile',
  'https://example.com/antalya-smile/contact',
  'Placeholder listing used to demo the site. Replace with a real, verified clinic before launch.',
  'published'
from cities ci join countries co on co.id = ci.country_id
where ci.slug = 'antalya' and co.slug = 'turkey'
on conflict (slug) do nothing;

insert into providers (name, slug, city_id, website_url, contact_url, description, status)
select
  'Example Cancun Hair Institute (SAMPLE)',
  'example-cancun-hair-institute',
  ci.id,
  'https://example.com/cancun-hair',
  'https://example.com/cancun-hair/contact',
  'Placeholder listing used to demo the site. Replace with a real, verified clinic before launch.',
  'published'
from cities ci join countries co on co.id = ci.country_id
where ci.slug = 'cancun' and co.slug = 'mexico'
on conflict (slug) do nothing;

insert into providers (name, slug, city_id, website_url, contact_url, description, status)
select
  'Example Bangkok Orthopedic Hospital (SAMPLE)',
  'example-bangkok-orthopedic-hospital',
  ci.id,
  'https://example.com/bangkok-ortho',
  'https://example.com/bangkok-ortho/contact',
  'Placeholder listing used to demo the site. Replace with a real, verified clinic before launch.',
  'published'
from cities ci join countries co on co.id = ci.country_id
where ci.slug = 'bangkok' and co.slug = 'thailand'
on conflict (slug) do nothing;

insert into provider_treatments (provider_id, treatment_id, price_min, price_max, currency, source_url, source_name, date_collected, verified)
select p.id, t.id, 600, 900, 'USD', 'https://example.com/bosphorus-dental/pricing', 'Provider website (sample)', current_date, true
from providers p, treatments t
where p.slug = 'example-bosphorus-dental-clinic' and t.slug = 'dental-implants'
on conflict (provider_id, treatment_id) do nothing;

insert into provider_treatments (provider_id, treatment_id, price_min, price_max, currency, source_url, source_name, date_collected, verified)
select p.id, t.id, 550, 850, 'USD', 'https://example.com/antalya-smile/pricing', 'Provider website (sample)', current_date, true
from providers p, treatments t
where p.slug = 'example-antalya-smile-center' and t.slug = 'dental-implants'
on conflict (provider_id, treatment_id) do nothing;

insert into provider_treatments (provider_id, treatment_id, price_min, price_max, currency, source_url, source_name, date_collected, verified)
select p.id, t.id, 2500, 4000, 'USD', 'https://example.com/cancun-hair/pricing', 'Provider website (sample)', current_date, true
from providers p, treatments t
where p.slug = 'example-cancun-hair-institute' and t.slug = 'hair-transplant'
on conflict (provider_id, treatment_id) do nothing;

insert into provider_treatments (provider_id, treatment_id, price_min, price_max, currency, source_url, source_name, date_collected, verified)
select p.id, t.id, 8000, 12000, 'USD', 'https://example.com/bangkok-ortho/pricing', 'Provider website (sample)', current_date, true
from providers p, treatments t
where p.slug = 'example-bangkok-orthopedic-hospital' and t.slug = 'knee-replacement'
on conflict (provider_id, treatment_id) do nothing;

-- ------------------------------------------------------------
-- To remove the sample data later, run:
--
-- delete from providers where slug like 'example-%';
-- (provider_treatments rows are removed automatically via ON DELETE CASCADE)
-- ------------------------------------------------------------

# Waypoint Health — MVP

A minimal medical-travel comparison directory: search a treatment, compare
clinics, click through to contact a provider directly. No accounts, no
payments, no booking — just search → results → provider contact, per the
product brief.

## Stack

- **Next.js 14** (App Router) — server-rendered pages, good for SEO, free
  tier on Vercel.
- **Supabase** (Postgres) — database + auto REST API + a free browser
  table editor, so you can manually enter listings with no admin panel to
  build. Same database will support automation later.
- **Tailwind CSS** — styling.

Total cost to run at MVP scale: **$0/month** (Vercel Hobby + Supabase Free).

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account and
   a new project.
2. Once it's ready, open **SQL Editor** in the left sidebar → **New query**.
3. Paste in the entire contents of [`supabase/schema.sql`](./supabase/schema.sql)
   and click **Run**.

This creates:
- Tables: `countries`, `cities`, `providers`, `treatments`, `provider_treatments`
- A `listings` view the website reads from (joins everything together)
- Row Level Security policies so the public website can only ever **read**
  published/verified rows — it can never write to your database
- A handful of clearly-labeled **sample/placeholder rows** (marked
  `(SAMPLE)`) so you can see the site working immediately. These are fake —
  replace them with real, verified data before you launch (see "Adding
  real data" below).

4. Go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key

## 2. Configure the app locally

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and paste in the two values from step 1:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Then install and run locally:

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, search "dental implants", and you should see
the sample listings.

## 3. Deploy to Vercel

1. Push this project to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. In the Vercel project's **Settings → Environment Variables**, add the same
   two variables from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Vercel auto-detects Next.js — no build config needed.

That's it — the site is live on a free Vercel domain (e.g.
`your-project.vercel.app`), and you can attach a custom domain later from
the same Settings page.

## Adding real data (manual, for now)

Do all data entry in the Supabase **Table Editor** (not the public site,
which is read-only by design):

1. Add rows to `countries` / `cities` if the location doesn't exist yet.
2. Add a row to `providers` — set `status` to `draft` while you're still
   verifying it, and to `published` only once you're confident the
   information is accurate.
3. Add a row to `treatments` if the treatment doesn't exist yet.
4. Add a row to `provider_treatments` linking the provider and treatment,
   with `price_min`/`price_max` from the provider's own public pricing page,
   `source_url` pointing to where you found it, and `date_collected` set to
   today. Leave price fields blank if you can't confidently find a price —
   don't guess. Set `verified` to `true` only once you're confident in the
   entry; only `verified = true` rows show on the public site.

This manual flow is intentionally the same shape an automated importer will
use later (see below), so nothing needs to be rebuilt when you automate it.

## Removing the sample data

Once you've added real providers, delete the placeholder ones:

```sql
delete from providers where slug like 'example-%';
```

(`provider_treatments` rows for those providers are removed automatically.)

## Future automation (not built yet, on purpose)

The schema is already shaped for this. When you're ready to reduce manual
entry:

- Write a separate script (not part of the public website) that fetches
  public provider pages and writes rows into `providers` /
  `provider_treatments` with `status = 'draft'` / `verified = false`.
- That script should use your Supabase **service role key** (never expose
  this in the website code) so it can bypass the read-only RLS policies.
- A human still reviews and flips `status`/`verified` to `true` before
  anything appears publicly — keeping the "don't invent facts" principle
  intact even as ingestion scales.

## Project structure

```
app/
  page.js                 → homepage (headline + search form)
  search/page.js           → results page, queries the `listings` view
  provider/[slug]/page.js  → single provider page
  layout.js, globals.css   → shared shell, fonts, disclaimer footer
lib/
  supabase.js              → Supabase client (uses the public anon key)
supabase/
  schema.sql                → paste into Supabase SQL Editor once
```

## Explicitly not built (by design, per the product brief)

Accounts/login, payments, booking, chat, telemedicine, reviews, quote
requests, travel/hotel partners. The database is structured so all of these
can be added later without a schema rewrite, but none of them exist yet.

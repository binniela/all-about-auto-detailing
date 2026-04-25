# Sharky's Mobile Detailing

Contemporary client-facing website for Sharky's Mobile Detailing with a private detailer portal backed by the shared CRM Supabase project.

This repo is the lighter, bento-style Sharky's site variant. It uses the same CRM data model as the original Sharky's site, but presents a different visual direction for the public homepage.

## What This Site Includes

- Public mobile-detailing homepage
- Sharky's logo, contact information, service area, and FAQ copy
- Hero reel carousel using Sharky's Instagram reel video assets
- Service package cards using Sharky's current service menu
- CRM-backed quote request form
- Detailer portal sign-in
- Business-scoped request dashboard
- Request statuses, notes, scheduling, appointment location, and delete confirmation
- Manual portal user provisioning script

## Tech Stack

- Next.js App Router
- React
- Supabase Auth and Database
- Lucide React icons
- Plain CSS with contemporary design tokens

## Key Files

```text
src/data/site.js          Business copy, packages, FAQ, and reel data
src/components/site-app.jsx
app/                      Next.js routes and layout
src/index.css             Public site and portal styling
src/lib/supabase.js       Supabase browser client
scripts/create-admin-user.mjs
```

Public assets:

```text
public/logo.jpg
public/instagram-glyph-gradient.svg
public/reels/*.mp4
```

## Shared CRM Contract

The CRM repo owns the real database schema:

```text
../crm/supabase/schema.sql
```

This site expects the shared Supabase project to include:

- `Business`
- `BusinessUser`
- `CustomerSubmission`
- `Subscription`
- `public.create_customer_submission_for_business_slug(...)`

The portal expects `CustomerSubmission` to include:

- `service`
- `internalNotes`
- `contactedAt`
- `scheduledAt`
- `appointmentLocation`
- `updatedAt`

For Sharky's, use this business slug:

```text
sharkys-mobile-detailing
```

## Environment

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Frontend variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_BUSINESS_SLUG=sharkys-mobile-detailing
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Only needed for local portal user provisioning:

```env
SUPABASE_SERVICE_ROLE_KEY=
```

Do not expose the service role key in frontend hosting.

## Local Development

Install dependencies:

```bash
npm install
```

Run the site:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run create:portal-user
```

`npm run create:admin` is an alias for the portal user provisioning script.

## Supabase Setup

Run the schema from the CRM repo in the Supabase SQL Editor:

```text
../crm/supabase/schema.sql
```

Then make sure the Sharky's business row exists:

```sql
insert into public."Business" (
  slug,
  name,
  "ownerEmail",
  phone,
  niche,
  status
)
values (
  'sharkys-mobile-detailing',
  'Sharky''s Mobile Detailing',
  'sharkysmobiledetailing@gmail.com',
  '(805) 574-3708',
  'mobile detailing',
  'active'
)
on conflict (slug) do update
set
  name = excluded.name,
  "ownerEmail" = excluded."ownerEmail",
  phone = excluded.phone,
  niche = excluded.niche,
  status = excluded.status
returning id, slug, name;
```

Use the returned `id` when creating the portal user.

## Portal User Provisioning

Create a portal user after the `Business` row exists:

```bash
npm run create:portal-user -- --business-id your-business-id --email owner@example.com --password temporary-password
```

Optional role:

```bash
npm run create:portal-user -- --business-id your-business-id --email owner@example.com --password temporary-password --role owner
```

## Routes

- `/` public website
- `/portal/signin` detailer portal sign-in
- `/portal` request dashboard
- `/portal/change-password` password change
- `/reset-password` password reset landing page

Legacy redirects:

- `/signin` redirects to `/portal/signin`
- `/admin` redirects to `/portal`
- `/admin/change-password` redirects to `/portal/change-password`

## Deployment

Deploy as a standard Next.js app on Vercel.

Set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_BUSINESS_SLUG`
- `NEXT_PUBLIC_SITE_URL`

## Validation

Before pushing:

```bash
npm run build
```

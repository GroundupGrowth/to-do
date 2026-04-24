# PM

A personal project management tool for a solo operator managing multiple clients.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth)
- Deployed on Vercel

## Setup

### 1. Install

```bash
npm install
```

### 2. Supabase

Create a Supabase project, then copy the URL and `anon` key into `.env.local`:

```bash
cp .env.example .env.local
# edit .env.local
```

Apply the schema and seed data via the Supabase SQL editor or CLI:

```bash
# In the Supabase SQL editor, run the contents of:
supabase/migrations/0001_init.sql
supabase/seed.sql
```

Enable **email** as a sign-in provider in Supabase Auth settings. Magic link is
the default flow — no password needed.

### 3. Run

```bash
npm run dev
```

Open <http://localhost:3000>, sign in with your email, and you're in.

## Data model

- `clients` — one row per client, including a long markdown notes field.
- `todos` — to-dos belonging to a client.
- `links` — reference links belonging to a client.

RLS is enabled on all tables. Any authenticated user can read/write everything
(this is a single-user tool — no per-user scoping needed).

## Structure

```
app/
  (app)/                  authenticated app shell
    page.tsx              main dashboard
    clients/page.tsx      clients list
    clients/[id]/page.tsx client detail
  login/                  magic link login
  auth/callback/          OAuth / magic link exchange
components/               reusable UI
lib/
  supabase/               client + server + middleware helpers
  queries.ts              all DB reads
  mutations.ts            all DB writes (server actions)
supabase/
  migrations/0001_init.sql
  seed.sql
```

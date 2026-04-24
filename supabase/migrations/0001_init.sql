-- PM — initial schema
-- Single-user internal tool with no auth layer (the app is "open on the link").
-- RLS stays enabled, and policies grant full access to everyone (anon +
-- authenticated). This is intentional for this specific use case — do NOT
-- copy these policies into a multi-user app.

create extension if not exists "pgcrypto";

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  notes text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  status text not null default 'todo',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint todos_status_check check (status in ('todo','in_progress','questions','postpone'))
);

create index if not exists todos_client_id_idx on public.todos(client_id);
create index if not exists todos_done_idx on public.todos(done);
create index if not exists todos_status_idx on public.todos(status);

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  label text not null,
  url text not null,
  created_at timestamptz not null default now()
);

create index if not exists links_client_id_idx on public.links(client_id);

-- Row Level Security
alter table public.clients enable row level security;
alter table public.todos enable row level security;
alter table public.links enable row level security;

-- Authenticated users can do anything.
drop policy if exists "clients_all_authenticated" on public.clients;
drop policy if exists "clients_all_public" on public.clients;
create policy "clients_all_public"
  on public.clients for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "todos_all_authenticated" on public.todos;
drop policy if exists "todos_all_public" on public.todos;
create policy "todos_all_public"
  on public.todos for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "links_all_authenticated" on public.links;
drop policy if exists "links_all_public" on public.links;
create policy "links_all_public"
  on public.links for all
  to anon, authenticated
  using (true)
  with check (true);

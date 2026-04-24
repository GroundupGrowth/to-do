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
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists clients_tags_idx on public.clients using gin(tags);

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  status text not null default 'todo',
  assignee text,
  completed_at timestamptz,
  -- triaged_at is NULL while the todo is in the Inbox (unrouted email).
  -- Once the user moves it to the board, we set it to now(). Manual creates
  -- from the UI skip the inbox by setting triaged_at = now() at insert.
  triaged_at timestamptz default now(),
  created_at timestamptz not null default now(),
  constraint todos_status_check check (status in ('todo','in_progress','questions','postpone')),
  constraint todos_assignee_check check (assignee is null or assignee in ('dylan','xander','emson','team'))
);

create index if not exists todos_client_id_idx on public.todos(client_id);
create index if not exists todos_done_idx on public.todos(done);
create index if not exists todos_status_idx on public.todos(status);
create index if not exists todos_assignee_idx on public.todos(assignee);
create index if not exists todos_triaged_at_idx on public.todos(triaged_at);

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  label text not null,
  url text not null,
  created_at timestamptz not null default now()
);

create index if not exists links_client_id_idx on public.links(client_id);

create table if not exists public.todo_notes (
  id uuid primary key default gen_random_uuid(),
  todo_id uuid not null references public.todos(id) on delete cascade,
  author text,
  body text not null,
  created_at timestamptz not null default now(),
  constraint todo_notes_author_check check (author is null or author in ('dylan','xander','emson','team'))
);

create index if not exists todo_notes_todo_id_idx on public.todo_notes(todo_id);

create table if not exists public.onboarding_steps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists onboarding_steps_position_idx on public.onboarding_steps(position);

create table if not exists public.onboarding_prompts (
  id uuid primary key default gen_random_uuid(),
  step_id uuid not null references public.onboarding_steps(id) on delete cascade,
  label text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists onboarding_prompts_step_id_idx on public.onboarding_prompts(step_id);

create table if not exists public.onboarding_links (
  id uuid primary key default gen_random_uuid(),
  step_id uuid not null references public.onboarding_steps(id) on delete cascade,
  label text not null,
  url text not null,
  created_at timestamptz not null default now()
);

create index if not exists onboarding_links_step_id_idx on public.onboarding_links(step_id);

-- Row Level Security
alter table public.clients enable row level security;
alter table public.todos enable row level security;
alter table public.links enable row level security;
alter table public.todo_notes enable row level security;
alter table public.onboarding_steps enable row level security;
alter table public.onboarding_prompts enable row level security;
alter table public.onboarding_links enable row level security;

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

drop policy if exists "todo_notes_all_public" on public.todo_notes;
create policy "todo_notes_all_public"
  on public.todo_notes for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "onboarding_steps_all_public" on public.onboarding_steps;
create policy "onboarding_steps_all_public"
  on public.onboarding_steps for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "onboarding_prompts_all_public" on public.onboarding_prompts;
create policy "onboarding_prompts_all_public"
  on public.onboarding_prompts for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "onboarding_links_all_public" on public.onboarding_links;
create policy "onboarding_links_all_public"
  on public.onboarding_links for all
  to anon, authenticated
  using (true)
  with check (true);

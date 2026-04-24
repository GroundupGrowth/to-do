-- Seed data so the UI is never empty on first load.
-- Idempotent: deletes existing rows first, then re-inserts.

delete from public.links;
delete from public.todos;
delete from public.clients;

with inserted as (
  insert into public.clients (id, name, description, notes) values
    (
      '11111111-1111-1111-1111-111111111111',
      'Northwind Studio',
      'Brand and web for a boutique design studio.',
      '# Northwind Studio

Working with **Maren** (creative director) and **Theo** (ops).

- Scope covers a homepage refresh and a small Webflow CMS migration.
- Invoices go to accounts@northwind.studio on Net-30.
- Kickoff call notes live in the shared Notion; paste summaries here.

## Open questions
- Do they want to keep the existing typography (Söhne) or move to the new Noe pairing?
- Who signs off on final copy — Maren alone, or does it need founder review?
'
    ),
    (
      '22222222-2222-2222-2222-222222222222',
      'Ridgeline Coffee',
      'Packaging refresh and a new e-commerce flow.',
      ''
    ),
    (
      '33333333-3333-3333-3333-333333333333',
      'Fieldnote Consulting',
      'Ongoing retainer — light monthly work.',
      ''
    )
  returning id
)
select 1 from inserted;

-- To-dos: 5 per client, realistic PM work, mix of statuses + done.
insert into public.todos (client_id, title, done, status, completed_at, created_at) values
  -- Northwind Studio
  ('11111111-1111-1111-1111-111111111111', 'Send Q1 invoice',                     true,  'todo',        now() - interval '3 days', now() - interval '10 days'),
  ('11111111-1111-1111-1111-111111111111', 'Review homepage copy v2',             false, 'in_progress', null,                      now() - interval '6 days'),
  ('11111111-1111-1111-1111-111111111111', 'Book kickoff call for CMS migration', false, 'todo',        null,                      now() - interval '5 days'),
  ('11111111-1111-1111-1111-111111111111', 'Share Figma prototype with Maren',    true,  'todo',        now() - interval '1 day',  now() - interval '4 days'),
  ('11111111-1111-1111-1111-111111111111', 'Draft scope doc for phase two',       false, 'questions',   null,                      now() - interval '2 days'),

  -- Ridgeline Coffee
  ('22222222-2222-2222-2222-222222222222', 'Approve label proofs from printer',     false, 'in_progress', null,                      now() - interval '8 days'),
  ('22222222-2222-2222-2222-222222222222', 'Write product descriptions for 6 SKUs', false, 'todo',        null,                      now() - interval '7 days'),
  ('22222222-2222-2222-2222-222222222222', 'Set up Shopify tax settings',           true,  'todo',        now() - interval '2 days', now() - interval '9 days'),
  ('22222222-2222-2222-2222-222222222222', 'Schedule product photography',          false, 'postpone',    null,                      now() - interval '4 days'),
  ('22222222-2222-2222-2222-222222222222', 'Confirm shipping carrier for launch',   true,  'todo',        now() - interval '5 days', now() - interval '11 days'),

  -- Fieldnote Consulting
  ('33333333-3333-3333-3333-333333333333', 'Monthly retainer check-in',       false, 'todo',        null,                      now() - interval '3 days'),
  ('33333333-3333-3333-3333-333333333333', 'Update case study draft',         false, 'in_progress', null,                      now() - interval '6 days'),
  ('33333333-3333-3333-3333-333333333333', 'Reply to speaking inquiry',       true,  'todo',        now() - interval '4 days', now() - interval '7 days'),
  ('33333333-3333-3333-3333-333333333333', 'Refresh pitch deck cover',        false, 'questions',   null,                      now() - interval '2 days'),
  ('33333333-3333-3333-3333-333333333333', 'Archive completed 2025 projects', true,  'todo',        now() - interval '1 day',  now() - interval '8 days');

-- Links: 2-3 per client.
insert into public.links (client_id, label, url) values
  ('11111111-1111-1111-1111-111111111111', 'Figma — Homepage v2',      'https://figma.com/file/northwind-home-v2'),
  ('11111111-1111-1111-1111-111111111111', 'Shared Notion',            'https://notion.so/northwind-shared'),
  ('11111111-1111-1111-1111-111111111111', 'Staging site',             'https://staging.northwind.studio'),

  ('22222222-2222-2222-2222-222222222222', 'Packaging brief (Google Doc)', 'https://docs.google.com/document/d/ridgeline-brief'),
  ('22222222-2222-2222-2222-222222222222', 'Printer portal',               'https://portal.printsmith.co/ridgeline'),

  ('33333333-3333-3333-3333-333333333333', 'Retainer agreement (PDF)', 'https://dropbox.com/s/fieldnote-retainer.pdf'),
  ('33333333-3333-3333-3333-333333333333', 'Case study draft',         'https://docs.google.com/document/d/fieldnote-case-study');

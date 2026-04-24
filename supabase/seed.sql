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

-- To-dos: 5 per client, realistic PM work, mix of statuses + assignees.
insert into public.todos (client_id, title, done, status, assignee, completed_at, created_at) values
  -- Northwind Studio
  ('11111111-1111-1111-1111-111111111111', 'Send Q1 invoice',                     true,  'todo',        'dylan',  now() - interval '3 days', now() - interval '10 days'),
  ('11111111-1111-1111-1111-111111111111', 'Review homepage copy v2',             false, 'in_progress', 'xander', null,                      now() - interval '6 days'),
  ('11111111-1111-1111-1111-111111111111', 'Book kickoff call for CMS migration', false, 'todo',        'dylan',  null,                      now() - interval '5 days'),
  ('11111111-1111-1111-1111-111111111111', 'Share Figma prototype with Maren',    true,  'todo',        'xander', now() - interval '1 day',  now() - interval '4 days'),
  ('11111111-1111-1111-1111-111111111111', 'Draft scope doc for phase two',       false, 'questions',   'team',   null,                      now() - interval '2 days'),

  -- Ridgeline Coffee
  ('22222222-2222-2222-2222-222222222222', 'Approve label proofs from printer',     false, 'in_progress', 'emson',  null,                      now() - interval '8 days'),
  ('22222222-2222-2222-2222-222222222222', 'Write product descriptions for 6 SKUs', false, 'todo',        'xander', null,                      now() - interval '7 days'),
  ('22222222-2222-2222-2222-222222222222', 'Set up Shopify tax settings',           true,  'todo',        'dylan',  now() - interval '2 days', now() - interval '9 days'),
  ('22222222-2222-2222-2222-222222222222', 'Schedule product photography',          false, 'postpone',    null,     null,                      now() - interval '4 days'),
  ('22222222-2222-2222-2222-222222222222', 'Confirm shipping carrier for launch',   true,  'todo',        'emson',  now() - interval '5 days', now() - interval '11 days'),

  -- Fieldnote Consulting
  ('33333333-3333-3333-3333-333333333333', 'Monthly retainer check-in',       false, 'todo',        'team',   null,                      now() - interval '3 days'),
  ('33333333-3333-3333-3333-333333333333', 'Update case study draft',         false, 'in_progress', 'dylan',  null,                      now() - interval '6 days'),
  ('33333333-3333-3333-3333-333333333333', 'Reply to speaking inquiry',       true,  'todo',        'dylan',  now() - interval '4 days', now() - interval '7 days'),
  ('33333333-3333-3333-3333-333333333333', 'Refresh pitch deck cover',        false, 'questions',   'xander', null,                      now() - interval '2 days'),
  ('33333333-3333-3333-3333-333333333333', 'Archive completed 2025 projects', true,  'todo',        'emson',  now() - interval '1 day',  now() - interval '8 days');

-- Onboarding flow: a realistic 5-step process with copy-ready prompts
-- and a handful of reference links per step.
delete from public.onboarding_links;
delete from public.onboarding_prompts;
delete from public.onboarding_steps;

insert into public.onboarding_steps (id, title, description, position) values
  ('aaaaaaa1-0000-0000-0000-000000000001',
    'Welcome email',
    'Sent within 24 hours of the signed proposal. Confirms next steps and sets expectations.',
    0),
  ('aaaaaaa1-0000-0000-0000-000000000002',
    'Schedule kickoff call',
    'Aim for 45 minutes inside the first week. Bring the PM doc and questionnaire.',
    1),
  ('aaaaaaa1-0000-0000-0000-000000000003',
    'Collect brand + access assets',
    'Logos, fonts, existing site logins, analytics access, social accounts.',
    2),
  ('aaaaaaa1-0000-0000-0000-000000000004',
    'Set up project workspace',
    'Create the shared Notion, Figma file, and invite the client.',
    3),
  ('aaaaaaa1-0000-0000-0000-000000000005',
    'First check-in',
    'Three business days after kickoff — short written update, no meeting required.',
    4);

insert into public.onboarding_prompts (step_id, label, body) values
  ('aaaaaaa1-0000-0000-0000-000000000001', 'Welcome email',
'Hi {{first_name}},

Great to have you on board. A few quick things to get us moving:

1. I''ll send a calendar invite for our kickoff within the next day — 45 minutes, video.
2. Before the call, please fill out the short questionnaire (link below).
3. You''ll get a shared Notion page in the next 48 hours; that''s where everything lives.

Reply here with any questions. Looking forward to building with you.

— Dylan'),
  ('aaaaaaa1-0000-0000-0000-000000000002', 'Kickoff agenda',
'Kickoff — {{client_name}}

1. Intros (5 min)
2. Goals for the engagement — what does success look like? (10 min)
3. Walkthrough of questionnaire answers (15 min)
4. Process, cadence, and communication (10 min)
5. Next steps + asset collection (5 min)'),
  ('aaaaaaa1-0000-0000-0000-000000000003', 'Asset request',
'Can you share the following when you have a moment?

- Logo files (SVG preferred, plus a PNG fallback)
- Any brand guidelines you use
- Login or admin access to your current site
- Read access to Google Analytics (or whichever analytics tool you use)
- Social accounts you''d like us to reference

Drop everything into the shared Google Drive folder I sent. No rush on the same-day, but ideally within the week.'),
  ('aaaaaaa1-0000-0000-0000-000000000004', 'Workspace handoff',
'Your shared Notion is live: {{notion_url}}

Inside you''ll find:
- A running log of decisions
- The current scope and timeline
- A weekly update page (I post Fridays)
- All reference links in one place

Figma file: {{figma_url}} — you''ve been added as a commenter.'),
  ('aaaaaaa1-0000-0000-0000-000000000005', 'Day-3 check-in',
'Quick update on {{client_name}}:

- {{what_shipped}}
- {{what''s_next}}
- {{blockers_or_questions}}

Nothing needed from you unless something here raises a flag. Full walkthrough on our Friday call.');

insert into public.onboarding_links (step_id, label, url) values
  ('aaaaaaa1-0000-0000-0000-000000000001', 'Welcome email template (Google Doc)',
    'https://docs.google.com/document/d/welcome-email-template'),
  ('aaaaaaa1-0000-0000-0000-000000000002', 'Kickoff questionnaire',
    'https://tally.so/r/kickoff-questionnaire'),
  ('aaaaaaa1-0000-0000-0000-000000000002', 'Calendar booking link',
    'https://cal.com/dylan/kickoff'),
  ('aaaaaaa1-0000-0000-0000-000000000003', 'Asset collection folder (Drive)',
    'https://drive.google.com/drive/folders/asset-template'),
  ('aaaaaaa1-0000-0000-0000-000000000004', 'Notion template',
    'https://notion.so/template/client-workspace'),
  ('aaaaaaa1-0000-0000-0000-000000000004', 'Figma starter file',
    'https://figma.com/file/starter-template'),
  ('aaaaaaa1-0000-0000-0000-000000000005', 'Weekly update template',
    'https://notion.so/template/weekly-update');

-- Links: 2-3 per client.
insert into public.links (client_id, label, url) values
  ('11111111-1111-1111-1111-111111111111', 'Figma — Homepage v2',      'https://figma.com/file/northwind-home-v2'),
  ('11111111-1111-1111-1111-111111111111', 'Shared Notion',            'https://notion.so/northwind-shared'),
  ('11111111-1111-1111-1111-111111111111', 'Staging site',             'https://staging.northwind.studio'),

  ('22222222-2222-2222-2222-222222222222', 'Packaging brief (Google Doc)', 'https://docs.google.com/document/d/ridgeline-brief'),
  ('22222222-2222-2222-2222-222222222222', 'Printer portal',               'https://portal.printsmith.co/ridgeline'),

  ('33333333-3333-3333-3333-333333333333', 'Retainer agreement (PDF)', 'https://dropbox.com/s/fieldnote-retainer.pdf'),
  ('33333333-3333-3333-3333-333333333333', 'Case study draft',         'https://docs.google.com/document/d/fieldnote-case-study');

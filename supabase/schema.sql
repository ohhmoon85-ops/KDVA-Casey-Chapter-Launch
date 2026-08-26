-- KDVA Casey Chapter Launch — RSVP table
-- Run this once in the Supabase SQL editor.
--
-- The table is named casey_rsvps, not rsvps, because this Supabase project
-- is shared with other apps. A bare `rsvps` risks colliding with a table
-- that already exists, in which case `create table if not exists` would
-- quietly do nothing and this app would write into someone else's table.
--
-- No RLS policies are defined on purpose. Every read and write goes through
-- a server route handler that uses the service role key, which bypasses RLS.
-- Nothing in the browser ever holds a Supabase key.

create table if not exists public.casey_rsvps (
  id               bigint      generated always as identity primary key,
  event            text        not null default 'casey-2026-09-16',
  name             text        not null,
  affiliation      text,
  unit             text,
  guests           int         not null default 0,
  email            text,
  wants_membership boolean     not null default false,
  created_at       timestamptz not null default now()
);

create index if not exists casey_rsvps_event_created_idx
  on public.casey_rsvps (event, created_at desc);

alter table public.casey_rsvps enable row level security;

-- Belt and braces: if an anon key ever reaches a browser by accident, it
-- still cannot read or write this table.
revoke all on public.casey_rsvps from anon, authenticated;

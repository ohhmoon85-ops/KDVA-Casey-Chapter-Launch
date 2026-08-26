-- KDVA Casey Chapter Launch — RSVP table
-- Run this once in the Supabase SQL editor.
--
-- No RLS policies are defined on purpose. Every read and write goes through
-- a server route handler that uses the service role key, which bypasses RLS.
-- Nothing in the browser ever holds a Supabase key.

create table if not exists public.rsvps (
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

create index if not exists rsvps_event_created_idx
  on public.rsvps (event, created_at desc);

alter table public.rsvps enable row level security;

-- Belt and braces: if an anon key ever reaches a browser by accident, it
-- still cannot read or write this table.
revoke all on public.rsvps from anon, authenticated;

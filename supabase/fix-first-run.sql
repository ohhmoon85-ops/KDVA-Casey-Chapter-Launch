-- Run this ONCE, only if you already ran the first version of schema.sql
-- (the one that created a table called `rsvps`).
--
-- It does three things:
--   1. creates casey_rsvps, the table this app actually uses
--   2. removes the leftover `rsvps` — but ONLY if it is empty and has
--      exactly this app's columns, so another app's table is left alone
--   3. lists every table in the public schema so you can see the result
--
-- Paste the whole file into the Supabase SQL Editor and press Run.

-- 1 ----------------------------------------------------------------------
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

revoke all on public.casey_rsvps from anon, authenticated;

-- 2 ----------------------------------------------------------------------
-- Guarded on purpose. If `rsvps` turns out to belong to another app, every
-- check below fails and the block does nothing rather than dropping data.
do $$
declare
  cols text;
  n    bigint;
begin
  select string_agg(column_name, ',' order by ordinal_position)
    into cols
    from information_schema.columns
   where table_schema = 'public'
     and table_name   = 'rsvps';

  -- No such table. Nothing to clean up.
  if cols is null then
    return;
  end if;

  -- Not the shape this app created. Leave it exactly as it is.
  if cols <> 'id,event,name,affiliation,unit,guests,email,wants_membership,created_at' then
    return;
  end if;

  -- Somebody's data is in there. Leave it alone.
  execute 'select count(*) from public.rsvps' into n;
  if n <> 0 then
    return;
  end if;

  execute 'drop table public.rsvps';
end $$;

-- 3 ----------------------------------------------------------------------
select table_name
  from information_schema.tables
 where table_schema = 'public'
   and table_type   = 'BASE TABLE'
 order by table_name;

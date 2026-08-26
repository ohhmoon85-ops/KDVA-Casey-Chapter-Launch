-- Run this ONCE in the Supabase SQL Editor.
--
-- The form no longer asks "guests with you", and email is now required.
-- Every reply is one named person with a way to reach them, which is the
-- point: this event is how the chapter meets people it hopes will join.
--
-- Guarded throughout. If anything is not as expected the block stops
-- rather than touching data.

do $$
declare
  missing bigint;
begin
  if to_regclass('public.casey_rsvps') is null then
    raise notice 'No casey_rsvps table. Run schema.sql instead.';
    return;
  end if;

  -- 1. Drop the guests column if it is still there.
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'casey_rsvps' and column_name = 'guests'
  ) then
    execute 'alter table public.casey_rsvps drop column guests';
    raise notice 'Dropped column guests.';
  end if;

  -- 2. Require email — but only if no existing row would be left invalid.
  execute 'select count(*) from public.casey_rsvps where email is null' into missing;

  if missing > 0 then
    raise notice 'Left email nullable: % existing row(s) have no email. Fill or delete them, then run this again.', missing;
    return;
  end if;

  execute 'alter table public.casey_rsvps alter column email set not null';
  raise notice 'email is now required.';
end $$;

-- What the table looks like afterwards.
select column_name, data_type, is_nullable
  from information_schema.columns
 where table_schema = 'public'
   and table_name   = 'casey_rsvps'
 order by ordinal_position;

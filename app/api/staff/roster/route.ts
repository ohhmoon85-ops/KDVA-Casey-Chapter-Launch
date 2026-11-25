import { NextResponse } from 'next/server';
import { EVENT, TABLE } from '@/lib/event';
import { memberEmails } from '@/lib/members';
import { isStaff } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase';
import type { Rsvp, RosterRow } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isStaff())) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin()
    .from(TABLE)
    .select('id, event, name, affiliation, unit, email, wants_membership, created_at')
    .eq('event', EVENT)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('roster read failed', error);
    return NextResponse.json({ error: 'Could not load the roster.' }, { status: 502 });
  }

  const rsvps = (data ?? []) as Rsvp[];

  // The roster is needed at the door even if the members lookup fails, so
  // that failure only switches the member tags off and says so.
  let members = new Set<string>();
  let membersUnavailable = false;
  try {
    members = await memberEmails(rsvps.map((r) => r.email));
  } catch (err) {
    console.error('members lookup failed', err);
    membersUnavailable = true;
  }

  const rows: RosterRow[] = rsvps.map((r) => ({
    ...r,
    is_member: members.has(r.email.trim().toLowerCase()),
  }));

  return NextResponse.json(
    { rows, membersUnavailable },
    // The roster changes as people sign up; never let a proxy hold a copy.
    { headers: { 'cache-control': 'no-store' } },
  );
}

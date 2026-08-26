import { NextResponse } from 'next/server';
import { EVENT, TABLE } from '@/lib/event';
import { isStaff } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase';
import type { Rsvp } from '@/lib/types';

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

  return NextResponse.json(
    { rows: (data ?? []) as Rsvp[] },
    // The roster changes as people sign up; never let a proxy hold a copy.
    { headers: { 'cache-control': 'no-store' } },
  );
}

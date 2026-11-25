import { NextResponse } from 'next/server';
import { EVENT, TABLE } from '@/lib/event';
import { memberEmails } from '@/lib/members';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Public, unauthenticated: the one number the form shows to encourage
 * joining — how many people signed up for KDVA through this event. It
 * answers that number and nothing else. No names, no emails, no rows.
 *
 * Counted as distinct people: an email that RSVP'd for this event, asked
 * to join, and is now in `members`.
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin()
      .from(TABLE)
      .select('email')
      .eq('event', EVENT)
      .eq('wants_membership', true);

    if (error) throw error;

    const emails = [...new Set((data ?? []).map((r) => String(r.email).trim().toLowerCase()))];
    const members = await memberEmails(emails);
    const joinedTonight = emails.filter((e) => members.has(e)).length;

    return NextResponse.json(
      { joinedTonight },
      { headers: { 'cache-control': 'public, s-maxage=30' } },
    );
  } catch (err) {
    console.error('stats failed', err);
    // The form hides the line when this fails, so say nothing useful.
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}

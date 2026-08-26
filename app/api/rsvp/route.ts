import { NextResponse } from 'next/server';
import { AFFILIATIONS, EVENT, TABLE } from '@/lib/event';
import { clientIp, rateLimit } from '@/lib/rateLimit';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** The message the form shows when nothing more specific applies. */
const GENERIC = 'That did not save. Check your connection and try once more.';

function reject(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Trim, collapse runs of whitespace, and cap the length. */
function clean(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

export async function POST(req: Request) {
  if (!rateLimit(`rsvp:${clientIp(req)}`)) {
    return reject('That is a lot of sign-ups at once. Wait a minute and try again.', 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return reject(GENERIC);
  }

  if (typeof body !== 'object' || body === null) return reject(GENERIC);
  const input = body as Record<string, unknown>;

  const name = clean(input.name, 120);
  if (name.length < 2) {
    return reject('Enter your name so we can find you on the list.');
  }

  const affiliation = clean(input.affiliation, 40);
  if (!(AFFILIATIONS as readonly string[]).includes(affiliation)) {
    return reject('Pick one of the options under "I am".');
  }

  const unit = clean(input.unit, 80) || null;

  const email = clean(input.email, 160);
  if (!email) {
    return reject('Enter your email so we can send you the reminder.');
  }
  // Deliberately loose. The check is here to catch typos, not to police
  // what an address may look like.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return reject('That email address does not look right.');
  }

  const wants_membership = input.wants_membership === true;

  // Registration stays open past the deadline on purpose. The cut-off is a
  // catering convenience, not a condition of attending, so this route never
  // turns anyone away — the form only changes what it says.
  try {
    const { error } = await supabaseAdmin()
      .from(TABLE)
      .insert({ event: EVENT, name, affiliation, unit, email, wants_membership });

    if (error) {
      console.error('rsvp insert failed', error);
      return reject(GENERIC, 502);
    }
  } catch (err) {
    console.error('rsvp insert threw', err);
    return reject(GENERIC, 502);
  }

  return NextResponse.json({ ok: true });
}

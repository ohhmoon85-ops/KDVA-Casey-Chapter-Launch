/**
 * Writes to the membership app's `members` table, which lives in the same
 * Supabase project. Every row written here lands in the HQ weekly report,
 * so the stored strings follow that app's rules exactly:
 *
 *   name    "Last First", 50 characters at most
 *   rank    composeRank() — see lib/membership.ts
 *   station this app's unit; null for a civilian who never served
 *   email   lower case, unique
 *
 * The `country` and `state` columns belong to that app. Never write them.
 */
import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { EVENT, TABLE } from '@/lib/event';
import { composeRank } from '@/lib/membership';
import { supabaseAdmin } from '@/lib/supabase';

const MEMBERS = 'members';

export type JoinResult = 'joined' | 'already' | { error: string };

export async function addMember(input: {
  /** As stored in casey_rsvps: "Last, First". */
  name: string;
  unit: string | null;
  email: string;
  status: unknown;
  rank: unknown;
}): Promise<JoinResult> {
  const rank = composeRank(input.status, input.rank);
  if (!rank) return { error: 'Pick your rank to join KDVA.' };

  const name = input.name.replace(', ', ' ').slice(0, 50);
  const station = input.status === '민간인' ? null : input.unit?.trim().slice(0, 100) || null;
  const email = input.email.trim().toLowerCase().slice(0, 200);

  const db = supabaseAdmin();

  const { data: existing, error: lookupError } = await db
    .from(MEMBERS)
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (lookupError) {
    console.error('member lookup failed', lookupError);
    return { error: 'lookup failed' };
  }
  if (existing) return 'already';

  const { error } = await db.from(MEMBERS).insert({ name, rank, station, email });

  if (error) {
    // Two taps, or the same person joining from two phones at once.
    if (error.code === '23505') return 'already';
    console.error('member insert failed', error);
    return { error: 'insert failed' };
  }

  return 'joined';
}

/**
 * Turns one RSVP for this event into a membership, after the caller has
 * decided they may (a matching join token, or a signed-in staff member).
 * Marks the RSVP as wanting membership too, so the roster tags agree.
 */
export async function joinFromRsvp(
  id: number,
  status: unknown,
  rank: unknown,
): Promise<JoinResult | 'not found'> {
  const db = supabaseAdmin();

  const { data: row, error } = await db
    .from(TABLE)
    .select('id, name, unit, email')
    .eq('id', id)
    .eq('event', EVENT)
    .maybeSingle();

  if (error) {
    console.error('rsvp lookup failed', error);
    return { error: 'lookup failed' };
  }
  if (!row) return 'not found';

  const result = await addMember({ name: row.name, unit: row.unit, email: row.email, status, rank });
  if (typeof result === 'object') return result;

  const { error: updateError } = await db.from(TABLE).update({ wants_membership: true }).eq('id', id);
  // The membership is what counts. A stale tag on the roster is not worth
  // telling the person their sign-up failed.
  if (updateError) console.error('wants_membership update failed', updateError);

  return result;
}

/** The subset of these addresses that already belong to a member, lower case. */
export async function memberEmails(emails: string[]): Promise<Set<string>> {
  const wanted = [...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))];
  const found = new Set<string>();

  // Kept well under the length a URL filter can carry.
  for (let i = 0; i < wanted.length; i += 100) {
    const { data, error } = await supabaseAdmin()
      .from(MEMBERS)
      .select('email')
      .in('email', wanted.slice(i, i + 100));

    if (error) throw error;
    for (const row of data ?? []) found.add(String(row.email).toLowerCase());
  }

  return found;
}

/**
 * Lets the phone that made an RSVP turn that one RSVP into a membership
 * later, without anyone being able to do it to an id they guessed. The
 * token is handed back only in the response to the original sign-up.
 *
 * Keyed on the service role key, which never leaves the server. Rotating
 * it invalidates old tokens, which only costs people the one-tap join.
 */
function sign(id: number): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set.');
  return createHmac('sha256', `join|${key}`).update(`rsvp.${id}`).digest('base64url');
}

export function joinToken(id: number): string {
  return sign(id);
}

export function joinTokenMatches(id: unknown, token: unknown): boolean {
  if (typeof id !== 'number' || !Number.isSafeInteger(id) || id < 1) return false;
  if (typeof token !== 'string') return false;

  const given = Buffer.from(token, 'utf8');
  const wanted = Buffer.from(sign(id), 'utf8');
  if (given.length !== wanted.length) return false;

  return timingSafeEqual(given, wanted);
}

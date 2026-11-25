import { NextResponse } from 'next/server';
import { composeRank, isServiceStatus } from '@/lib/membership';
import { joinFromRsvp, joinTokenMatches } from '@/lib/members';
import { clientIp, rateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GENERIC = 'That did not save. Check your connection and try once more.';

function reject(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * For someone who checked in only and changed their mind. The phone that
 * made the RSVP holds a token for that one row; without it nobody can turn
 * an RSVP they did not make into a membership.
 */
export async function POST(req: Request) {
  if (!rateLimit(`join:${clientIp(req)}`)) {
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

  if (!joinTokenMatches(input.id, input.token)) {
    return reject('This check-in cannot be changed from here. Ask a KDVA staff member.', 403);
  }

  if (!isServiceStatus(input.status)) {
    return reject('Pick your service status to join KDVA.');
  }
  if (!composeRank(input.status, input.rank)) {
    return reject('Pick your rank to join KDVA.');
  }

  try {
    const result = await joinFromRsvp(input.id as number, input.status, input.rank);
    if (result === 'not found') {
      return reject('This check-in cannot be changed from here. Ask a KDVA staff member.', 404);
    }
    if (typeof result === 'object') return reject(GENERIC, 502);
    return NextResponse.json({ ok: true, member: result });
  } catch (err) {
    console.error('join threw', err);
    return reject(GENERIC, 502);
  }
}

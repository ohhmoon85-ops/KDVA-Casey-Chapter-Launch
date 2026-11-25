import { NextResponse } from 'next/server';
import { composeRank, isServiceStatus } from '@/lib/membership';
import { joinFromRsvp } from '@/lib/members';
import { isStaff } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function reject(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * MAKE MEMBER on the roster: someone told a staff member they want to
 * join, or ticked the box before the form asked for a rank.
 */
export async function POST(req: Request) {
  if (!(await isStaff())) return reject('Not signed in.', 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return reject('That did not save. Try once more.');
  }
  if (typeof body !== 'object' || body === null) return reject('That did not save. Try once more.');
  const input = body as Record<string, unknown>;

  const id = input.id;
  if (typeof id !== 'number' || !Number.isSafeInteger(id) || id < 1) {
    return reject('That row is not on the list.');
  }
  if (!isServiceStatus(input.status)) return reject('Pick a service status.');
  if (!composeRank(input.status, input.rank)) return reject('Pick a rank.');

  try {
    const result = await joinFromRsvp(id, input.status, input.rank);
    if (result === 'not found') return reject('That row is not on the list.', 404);
    if (typeof result === 'object') return reject('That did not save. Try once more.', 502);
    return NextResponse.json({ ok: true, member: result });
  } catch (err) {
    console.error('staff join threw', err);
    return reject('That did not save. Try once more.', 502);
  }
}

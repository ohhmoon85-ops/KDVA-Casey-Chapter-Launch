import { NextResponse } from 'next/server';
import { clientIp, rateLimit } from '@/lib/rateLimit';
import { STAFF_COOKIE, issueToken, pinMatches } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // A short PIN is guessable if you are allowed to guess quickly. Five tries
  // a minute turns a four digit PIN from seconds of work into days of it.
  if (!rateLimit(`staff-login:${clientIp(req)}`, 5)) {
    return NextResponse.json(
      { error: 'Too many tries. Wait a minute.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'That PIN is not right.' }, { status: 401 });
  }

  const pin = (body as Record<string, unknown> | null)?.pin;

  if (!pinMatches(pin)) {
    return NextResponse.json({ error: 'That PIN is not right.' }, { status: 401 });
  }

  const token = issueToken();
  const res = NextResponse.json({ ok: true });

  res.cookies.set(STAFF_COOKIE, token.value, {
    httpOnly: true, // script on the page cannot read it
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: token.maxAge,
  });

  return res;
}

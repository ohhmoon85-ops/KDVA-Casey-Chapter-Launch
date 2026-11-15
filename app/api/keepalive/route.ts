import { NextResponse } from 'next/server';
import { TABLE } from '@/lib/event';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Keeps the free Supabase project from being paused for inactivity.
 *
 * A paused project makes every RSVP fail, and the site can sit quiet for weeks
 * before 3 December. Supabase counts any request as activity, so one row of
 * `id` is enough: this route reads and never writes, and it returns no row.
 *
 * There is no secret in the URL on purpose. `.github/workflows/keepalive.yml`
 * calls it once a day from a cron with nothing stored, and the route gives
 * away nothing a visitor could not already guess — no count, no names, no way
 * to change an RSVP. If it ever needed protecting, a header check would come
 * first, and that would also need a GitHub secret.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'cache-control': 'no-store' } as const;

export async function GET() {
  try {
    const { error } = await supabaseAdmin().from(TABLE).select('id').limit(1);

    if (error) {
      // The real reason belongs in Vercel → Logs, not in the response.
      console.error('keep-alive read failed', error);
      return NextResponse.json(
        { ok: false, error: 'Database read failed.' },
        { status: 502, headers: NO_STORE },
      );
    }
  } catch (err) {
    console.error('keep-alive threw', err);
    return NextResponse.json(
      { ok: false, error: 'Database read failed.' },
      { status: 502, headers: NO_STORE },
    );
  }

  return NextResponse.json({ ok: true, ts: new Date().toISOString() }, { headers: NO_STORE });
}

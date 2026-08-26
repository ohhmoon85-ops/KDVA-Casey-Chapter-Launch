import 'server-only';

/**
 * A bored soldier with a script could otherwise put four hundred names on
 * the list, and the catering count is the one number this app exists to
 * produce. Ten sign-ups per minute per address is far above what a real
 * person does and far below what a script needs to be useful.
 *
 * This counts per running server instance, so on Vercel the real ceiling is
 * higher than ten when traffic spreads across instances. That is fine — it
 * blunts a casual flood, which is all it is for. It is not a security
 * control, and nothing downstream depends on it.
 */

const WINDOW_MS = 60_000;
const LIMIT = 10;

const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = LIMIT, windowMs = WINDOW_MS): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;

  const recent = (hits.get(key) ?? []).filter((t) => t > cutoff);

  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }

  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 2000) {
    for (const [k, times] of hits) {
      if (times.length === 0 || times[times.length - 1] <= cutoff) hits.delete(k);
    }
  }

  return true;
}

/** Best effort. Behind Vercel the first hop of x-forwarded-for is the caller. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

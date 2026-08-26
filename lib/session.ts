import 'server-only';
import { createHmac, createHash, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const STAFF_COOKIE = 'kdva_staff';

const TTL_MS = 12 * 60 * 60 * 1000; // one long evening, per the spec

/**
 * The signing key is the PIN plus the Supabase key. Using the PIN alone
 * would mean a four digit HMAC key, so anyone holding a cookie could work
 * out how to forge one. Mixing in a value the browser never sees removes
 * that. Rotating either value logs staff out, which is the right outcome.
 */
function signingKey(): string {
  const pin = process.env.STAFF_PIN;
  if (!pin) throw new Error('STAFF_PIN is not set.');
  return `${pin}|${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''}`;
}

function sign(expiry: number): string {
  return createHmac('sha256', signingKey()).update(`staff.${expiry}`).digest('base64url');
}

export function issueToken(): { value: string; maxAge: number } {
  const expiry = Date.now() + TTL_MS;
  return { value: `${expiry}.${sign(expiry)}`, maxAge: Math.floor(TTL_MS / 1000) };
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;

  const split = token.indexOf('.');
  if (split < 1) return false;

  const expiry = Number(token.slice(0, split));
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;

  const given = Buffer.from(token.slice(split + 1), 'utf8');
  const wanted = Buffer.from(sign(expiry), 'utf8');
  if (given.length !== wanted.length) return false;

  return timingSafeEqual(given, wanted);
}

/** Constant time regardless of where the two PINs first differ. */
export function pinMatches(candidate: unknown): boolean {
  const expected = process.env.STAFF_PIN;
  if (!expected || typeof candidate !== 'string') return false;

  const a = createHash('sha256').update(candidate, 'utf8').digest();
  const b = createHash('sha256').update(expected, 'utf8').digest();
  return timingSafeEqual(a, b);
}

export async function isStaff(): Promise<boolean> {
  try {
    const jar = await cookies();
    return verifyToken(jar.get(STAFF_COOKIE)?.value);
  } catch {
    return false;
  }
}

/**
 * Facts about the event. Safe to import from anywhere — nothing secret here.
 */

export const EVENT = 'casey-2026-09-16';

/**
 * The Supabase project is shared with other apps, so the table carries a
 * prefix rather than sitting on a name as common as `rsvps`. Keep this in
 * step with supabase/schema.sql.
 */
export const TABLE = 'casey_rsvps';

export const AFFILIATIONS = [
  'U.S. Soldier',
  'KATUSA',
  'ROK military',
  'DoD civilian',
  'Family member',
  'Guest',
] as const;

export type Affiliation = (typeof AFFILIATIONS)[number];

/** Yyyy-mm-dd. The last day we can still hand a count to catering. */
export const RSVP_DEADLINE = process.env.NEXT_PUBLIC_RSVP_DEADLINE ?? '2026-09-04';

/**
 * The deadline is a catering cut-off, not a condition of attending. Passing
 * it changes one sentence on the form and nothing else — registration stays
 * open, and so does the door.
 *
 * The deadline day itself still counts, so we close at the end of it,
 * Korea time. If the date is ever mistyped we leave the form as it was:
 * showing "closed" when it is not is the worse mistake.
 */
export function registrationClosed(now: Date = new Date()): boolean {
  const cutoff = Date.parse(`${RSVP_DEADLINE}T23:59:59+09:00`);
  if (!Number.isFinite(cutoff)) return false;
  return now.getTime() > cutoff;
}

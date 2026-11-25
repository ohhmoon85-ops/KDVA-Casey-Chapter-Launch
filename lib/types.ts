/** One row of public.casey_rsvps. Mirrors supabase/schema.sql. */
export type Rsvp = {
  id: number;
  event: string;
  name: string;
  affiliation: string | null;
  unit: string | null;
  email: string;
  wants_membership: boolean;
  created_at: string;
};

/** A roster row, plus whether that email is already in `members`. */
export type RosterRow = Rsvp & { is_member: boolean };

/** What POST /api/rsvp accepts. `status` and `rank` only matter when joining. */
export type RsvpInput = {
  last_name: string;
  first_name: string;
  affiliation: string;
  unit: string | null;
  email: string;
  join: boolean;
  status?: string;
  rank?: string;
};

/** What POST /api/rsvp answers. The token lets this phone join later. */
export type RsvpResult = {
  ok: true;
  id: number;
  token: string;
  member: 'joined' | 'already' | 'failed' | null;
};

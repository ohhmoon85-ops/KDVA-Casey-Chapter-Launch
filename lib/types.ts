/** One row of public.rsvps. Mirrors supabase/schema.sql. */
export type Rsvp = {
  id: number;
  event: string;
  name: string;
  affiliation: string | null;
  unit: string | null;
  guests: number;
  email: string | null;
  wants_membership: boolean;
  created_at: string;
};

/** What POST /api/rsvp accepts. */
export type RsvpInput = {
  name: string;
  affiliation: string;
  unit: string | null;
  guests: number;
  email: string | null;
  wants_membership: boolean;
};

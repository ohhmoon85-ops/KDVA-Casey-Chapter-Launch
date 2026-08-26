/**
 * The only place a Supabase key is ever read.
 *
 * `server-only` is not decoration: if any client component ever imports this
 * file, even indirectly, the build fails instead of shipping the service role
 * key to a browser. That is the single most important rule in this project,
 * so it is enforced by the compiler rather than by memory.
 */
import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/**
 * Built on first use, not at import time, so `next build` still works on a
 * machine that has no keys — the pages that do not touch the database keep
 * building, and the ones that do fail loudly at request time instead.
 */
export function supabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not set. ' +
        'Add them to .env.local for local work, and to the Vercel project settings for the deployed site.',
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-application-name': 'kdva-casey-launch' } },
  });

  return client;
}

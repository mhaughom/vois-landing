import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/**
 * Lazy service-role Supabase client. Cached across invocations within the
 * same serverless instance. Always uses the service role key — bypasses RLS.
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — configure in Vercel env',
    );
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

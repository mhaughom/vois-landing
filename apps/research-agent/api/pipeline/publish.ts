import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCors } from '../_cors';
import { requireAuth } from '../_auth';
import { getSupabase } from '../_supabase';

/**
 * POST /api/pipeline/publish
 * Body: { id: string }
 *
 * Flips the prospect row to status='published' and sets published_at.
 * Once published, the `/for/:slug` route on habos.ai becomes reachable
 * (RLS policy `status = 'published'` allows anon reads).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  const { id } = (req.body ?? {}) as { id?: string };
  if (!id) return res.status(400).json({ error: 'id required' });

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('personalized_pages')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('[pipeline/publish]', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}

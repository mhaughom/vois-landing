import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCors } from '../_cors';
import { requireAuth } from '../_auth';
import { getSupabase } from '../_supabase';

/**
 * GET /api/prospects/list — returns all prospects ordered by updated_at desc.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('personalized_pages')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return res.status(200).json(data ?? []);
  } catch (err: any) {
    console.error('[prospects/list]', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}

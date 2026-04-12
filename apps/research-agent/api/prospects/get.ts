import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCors } from '../_cors';
import { requireAuth } from '../_auth';
import { getSupabase } from '../_supabase';

/**
 * GET /api/prospects/get?id=<uuid> — returns a single prospect row.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  const id = typeof req.query.id === 'string' ? req.query.id : null;
  if (!id) return res.status(400).json({ error: 'id query param required' });

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('personalized_pages')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('[prospects/get]', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}

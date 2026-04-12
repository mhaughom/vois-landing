import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCors } from '../_cors';
import { requireAuth } from '../_auth';
import { getSupabase } from '../_supabase';

/**
 * GET /api/prospects/history?id=<uuid>&type=<hero|email>
 *
 * Returns the last 20 generation history entries for a prospect + artifact
 * type, newest first. Read-only for v1 — no restore endpoint. To roll back,
 * inspect the brief/outputs of a past entry and manually update via the
 * hero editor.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  const id = typeof req.query.id === 'string' ? req.query.id : null;
  const type = typeof req.query.type === 'string' ? req.query.type : null;
  if (!id) return res.status(400).json({ error: 'id query param required' });
  if (type !== 'hero' && type !== 'email') {
    return res.status(400).json({ error: "type must be 'hero' or 'email'" });
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('prospect_generation_history')
      .select('*')
      .eq('prospect_id', id)
      .eq('artifact_type', type)
      .order('generated_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return res.status(200).json(data ?? []);
  } catch (err: any) {
    console.error('[prospects/history]', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}

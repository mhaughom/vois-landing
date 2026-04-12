import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCors } from '../_cors';
import { requireAuth } from '../_auth';
import { getSupabase } from '../_supabase';

/**
 * GET /api/support/list?status=unread|open|waiting|closed
 *
 * Returns the most recent support threads, newest last_message_at first.
 * Optional status filter.
 */

const VALID_STATUS = new Set(['unread', 'open', 'waiting', 'closed']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  const status = typeof req.query.status === 'string' ? req.query.status : null;

  try {
    const supabase = getSupabase();
    let query = supabase
      .from('support_threads')
      .select('*')
      .order('last_message_at', { ascending: false })
      .limit(200);

    if (status && VALID_STATUS.has(status)) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return res.status(200).json(data ?? []);
  } catch (err: any) {
    console.error('[support/list]', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}

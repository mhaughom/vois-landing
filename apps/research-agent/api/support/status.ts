import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCors } from '../_cors';
import { requireAuth } from '../_auth';
import { getSupabase } from '../_supabase';

/**
 * POST /api/support/status
 * Body: { id: string, status: 'unread' | 'open' | 'waiting' | 'closed' }
 *
 * Update a support thread's status. Used by the inbox UI for "mark as read",
 * "close thread", etc.
 */

const VALID_STATUS = new Set(['unread', 'open', 'waiting', 'closed']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  const { id, status } = (req.body ?? {}) as { id?: string; status?: string };
  if (!id) return res.status(400).json({ error: 'id required' });
  if (!status || !VALID_STATUS.has(status)) {
    return res.status(400).json({ error: 'Valid status required' });
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('support_threads')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('[support/status]', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}

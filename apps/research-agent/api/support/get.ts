import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCors } from '../_cors';
import { requireAuth } from '../_auth';
import { getSupabase } from '../_supabase';

/**
 * GET /api/support/get?id=<uuid>
 *
 * Returns a support thread with its full message history and the linked
 * prospect (if the inbound sender matched a known prospect's recipient_email
 * at webhook time).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  const id = typeof req.query.id === 'string' ? req.query.id : null;
  if (!id) return res.status(400).json({ error: 'id query param required' });

  try {
    const supabase = getSupabase();

    const { data: thread, error: threadErr } = await supabase
      .from('support_threads')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (threadErr) throw threadErr;
    if (!thread) return res.status(404).json({ error: 'Thread not found' });

    const { data: messages, error: msgErr } = await supabase
      .from('support_messages')
      .select('*')
      .eq('thread_id', id)
      .order('received_at', { ascending: true });
    if (msgErr) throw msgErr;

    let prospect: {
      id: string;
      slug: string;
      company_name: string;
    } | null = null;
    if (thread.prospect_id) {
      const { data: p } = await supabase
        .from('personalized_pages')
        .select('id, slug, company_name')
        .eq('id', thread.prospect_id as string)
        .maybeSingle();
      if (p) {
        prospect = {
          id: p.id as string,
          slug: p.slug as string,
          company_name: p.company_name as string,
        };
      }
    }

    return res.status(200).json({
      ...thread,
      messages: messages ?? [],
      prospect,
    });
  } catch (err: any) {
    console.error('[support/get]', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}

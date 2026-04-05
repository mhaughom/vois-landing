import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders } from './_cors';

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured');
  return createClient(url, key);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Parse body — sendBeacon sends as text/plain, fetch sends as application/json
  let body: Record<string, unknown>;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const {
    id,
    visitor_id,
    started_at,
    page,
    message_count,
    email_captured,
    booking_clicked,
    messages,
    metadata,
  } = body as {
    id?: string;
    visitor_id: string;
    started_at?: string;
    page?: string;
    message_count?: number;
    email_captured?: boolean;
    booking_clicked?: boolean;
    messages?: unknown[];
    metadata?: Record<string, unknown>;
  };

  if (!visitor_id) return res.status(400).json({ error: 'visitor_id required' });

  try {
    const supabase = getSupabaseAdmin();

    const row = {
      ...(id ? { id } : {}),
      visitor_id,
      started_at: started_at || new Date().toISOString(),
      ended_at: new Date().toISOString(),
      page: page || null,
      message_count: message_count || 0,
      email_captured: email_captured || false,
      booking_clicked: booking_clicked || false,
      messages: messages || [],
      metadata: metadata || {},
    };

    const { data, error } = id
      ? await supabase
          .from('chat_conversations')
          .upsert(row, { onConflict: 'id' })
          .select('id')
          .single()
      : await supabase
          .from('chat_conversations')
          .insert(row)
          .select('id')
          .single();

    if (error) {
      console.error('Conversation save error:', error);
      return res.status(500).json({ error: 'Failed to save conversation' });
    }

    return res.status(200).json({ success: true, id: data?.id });
  } catch (err) {
    console.error('Conversation API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

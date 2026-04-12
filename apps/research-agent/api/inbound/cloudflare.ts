import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase } from '../_supabase';
import { timingSafeEqual } from 'node:crypto';

/**
 * POST /api/inbound/cloudflare
 *
 * Webhook called by a Cloudflare Email Worker when an email lands at any
 * *@habos.ai address that's routed through this system. The Worker is
 * responsible for parsing the MIME and POSTing this structured JSON payload.
 *
 * Worker deployment + source: see
 *   apps/research-agent/infrastructure/cloudflare-email-worker.js
 *
 * Auth: this route does NOT use the research-agent password. It uses a
 * separate shared secret in the `X-Webhook-Secret` header, checked against
 * CLOUDFLARE_INBOUND_WEBHOOK_SECRET env var. Anyone knowing the URL but not
 * the secret gets 401.
 *
 * Thread matching:
 *   - If In-Reply-To matches an existing message's message_id → append
 *   - Else if from_email matches a recent unclosed thread → append
 *   - Else create a new thread
 *
 * Prospect linking:
 *   - If from_email matches any `personalized_pages.recipient_email`,
 *     set `thread.prospect_id`
 */

interface InboundPayload {
  from: string;
  from_name?: string;
  to?: string[];
  cc?: string[];
  subject?: string;
  body_text: string;
  body_html?: string;
  message_id?: string;
  in_reply_to?: string;
  references?: string[];
  received_at?: string;
}

function verifyWebhookSecret(req: VercelRequest): boolean {
  const provided = req.headers['x-webhook-secret'];
  const expected = process.env.CLOUDFLARE_INBOUND_WEBHOOK_SECRET;
  if (!expected) {
    console.error('[inbound/cloudflare] CLOUDFLARE_INBOUND_WEBHOOK_SECRET not set');
    return false;
  }
  if (typeof provided !== 'string') return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // No CORS — this endpoint is only called by the Cloudflare Worker, not browsers
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!verifyWebhookSecret(req)) return res.status(401).json({ error: 'Unauthorized' });

  const payload = (req.body ?? {}) as InboundPayload;
  if (!payload.from || !payload.body_text) {
    return res.status(400).json({ error: 'from and body_text required' });
  }

  const supabase = getSupabase();
  const receivedAt = payload.received_at || new Date().toISOString();

  try {
    // ─── 1. Determine the thread ─────────────────────────────────────────
    let threadId: string | null = null;

    // a) If this is a reply and we know the parent's Message-ID, look it up
    if (payload.in_reply_to) {
      const { data: parentMsg } = await supabase
        .from('support_messages')
        .select('thread_id')
        .eq('message_id', payload.in_reply_to)
        .maybeSingle();
      if (parentMsg?.thread_id) threadId = parentMsg.thread_id as string;
    }

    // b) Otherwise, try finding a recent non-closed thread from the same sender
    if (!threadId) {
      const { data: recentThread } = await supabase
        .from('support_threads')
        .select('id')
        .eq('from_email', payload.from)
        .neq('status', 'closed')
        .order('last_message_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (recentThread) threadId = recentThread.id as string;
    }

    // c) If still no thread, create one
    if (!threadId) {
      // Prospect auto-link: match sender's email against any prospect's recipient_email
      const { data: matchedProspect } = await supabase
        .from('personalized_pages')
        .select('id')
        .eq('recipient_email', payload.from)
        .maybeSingle();

      const { data: newThread, error: threadErr } = await supabase
        .from('support_threads')
        .insert({
          subject: payload.subject || null,
          from_email: payload.from,
          from_name: payload.from_name || null,
          status: 'unread',
          prospect_id: (matchedProspect?.id as string) || null,
          last_message_at: receivedAt,
        })
        .select('id')
        .single();

      if (threadErr) throw threadErr;
      threadId = newThread.id as string;
    } else {
      // Existing thread: bump last_message_at, re-open if it was closed, mark unread if it was waiting
      const { data: currentThread } = await supabase
        .from('support_threads')
        .select('status')
        .eq('id', threadId)
        .maybeSingle();
      const newStatus =
        currentThread?.status === 'closed' ? 'unread'
        : currentThread?.status === 'waiting' ? 'open'
        : currentThread?.status || 'unread';
      await supabase
        .from('support_threads')
        .update({ last_message_at: receivedAt, status: newStatus })
        .eq('id', threadId);
    }

    // ─── 2. Insert the inbound message ───────────────────────────────────
    const { error: insertErr } = await supabase.from('support_messages').insert({
      thread_id: threadId,
      direction: 'inbound',
      from_email: payload.from,
      to_emails: payload.to ?? [],
      cc_emails: payload.cc ?? [],
      subject: payload.subject || null,
      body_text: payload.body_text,
      body_html: payload.body_html || null,
      message_id: payload.message_id || null,
      in_reply_to: payload.in_reply_to || null,
      references_ids: payload.references ?? null,
      received_at: receivedAt,
    });

    if (insertErr) throw insertErr;

    return res.status(200).json({ ok: true, thread_id: threadId });
  } catch (err: any) {
    console.error('[inbound/cloudflare]', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}

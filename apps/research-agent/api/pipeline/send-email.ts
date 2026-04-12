import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCors } from '../_cors';
import { requireAuth } from '../_auth';
import { getSupabase } from '../_supabase';

/**
 * POST /api/pipeline/send-email
 * Body: { id: string, thread_id?: string }
 *
 * Sends the current draft email on a prospect via Resend. If `thread_id` is
 * provided, this is a reply to a support thread — adds proper RFC 5322
 * threading headers (In-Reply-To, References) and logs the outbound message
 * to `support_messages`.
 *
 * Plain text only. No HTML body. This is deliberate: cold-outbound
 * deliverability and a "real human sent this" feel both depend on it.
 *
 * Required env:
 *   RESEND_API_KEY   — Resend API key (send-only scope is fine)
 *   EMAIL_FROM       — e.g. "Mathias Haughom <mathias@habos.ai>"
 *   EMAIL_REPLY_TO   — e.g. "mathias@habos.ai"
 */

interface ResendSuccess {
  id: string;
}

interface ResendError {
  statusCode?: number;
  name?: string;
  message?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  const { id, thread_id } = (req.body ?? {}) as { id?: string; thread_id?: string };
  if (!id) return res.status(400).json({ error: 'id required' });

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'mathias@habos.ai';
  const replyTo = process.env.EMAIL_REPLY_TO || 'mathias@habos.ai';
  if (!resendKey) {
    return res.status(500).json({
      error: 'RESEND_API_KEY not set. Add it to Vercel env + local .env.',
    });
  }

  try {
    const supabase = getSupabase();

    // Load prospect draft
    const { data: row, error } = await supabase
      .from('personalized_pages')
      .select(
        'id, slug, company_name, recipient_email, email_subject, email_body, email_status',
      )
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!row) return res.status(404).json({ error: 'Prospect not found' });
    if (!row.recipient_email) {
      return res.status(400).json({ error: 'recipient_email not set on prospect' });
    }
    if (!row.email_subject || !row.email_body) {
      return res.status(400).json({ error: 'Draft email is empty. Generate or write it first.' });
    }

    // If replying to a support thread, load the last inbound message to get
    // Message-ID + References for RFC 5322 threading.
    let inReplyTo: string | null = null;
    let references: string[] | null = null;
    if (thread_id) {
      const { data: lastInbound } = await supabase
        .from('support_messages')
        .select('message_id, references_ids')
        .eq('thread_id', thread_id)
        .eq('direction', 'inbound')
        .order('received_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lastInbound?.message_id) {
        inReplyTo = lastInbound.message_id as string;
        const priorRefs = (lastInbound.references_ids as string[] | null) || [];
        references = [...priorRefs, lastInbound.message_id as string];
      }
    }

    // Build Resend payload. Resend supports custom headers for threading.
    const resendHeaders: Record<string, string> = {};
    if (inReplyTo) resendHeaders['In-Reply-To'] = inReplyTo;
    if (references && references.length > 0) {
      resendHeaders['References'] = references.map((r) => (r.startsWith('<') ? r : `<${r}>`)).join(' ');
    }

    const resendBody = {
      from,
      to: [row.recipient_email],
      subject: row.email_subject,
      text: row.email_body,
      reply_to: replyTo,
      headers: resendHeaders,
    };

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendBody),
    });

    const respText = await resp.text();
    if (!resp.ok) {
      let parsedErr: ResendError = {};
      try {
        parsedErr = JSON.parse(respText);
      } catch {
        /* non-json */
      }
      console.error('[send-email] resend error', resp.status, parsedErr);
      return res.status(502).json({
        error: 'Resend rejected the send',
        detail: parsedErr.message || respText,
      });
    }

    let sendResult: ResendSuccess = { id: '' };
    try {
      sendResult = JSON.parse(respText);
    } catch {
      /* ignore */
    }

    const sentAt = new Date().toISOString();

    // Update prospect row
    const { data: updated, error: updateErr } = await supabase
      .from('personalized_pages')
      .update({ email_sent_at: sentAt, email_status: 'sent' })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // If this was a thread reply, log the outbound message and mark thread waiting
    if (thread_id) {
      await supabase.from('support_messages').insert({
        thread_id,
        direction: 'outbound',
        from_email: replyTo,
        to_emails: [row.recipient_email],
        subject: row.email_subject,
        body_text: row.email_body,
        message_id: sendResult.id || null,
        in_reply_to: inReplyTo,
        references_ids: references,
      });
      await supabase
        .from('support_threads')
        .update({ status: 'waiting', last_message_at: sentAt })
        .eq('id', thread_id);
    }

    return res.status(200).json(updated);
  } catch (err: any) {
    console.error('[pipeline/send-email]', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}

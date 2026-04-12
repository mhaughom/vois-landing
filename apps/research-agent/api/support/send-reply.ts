import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCors } from '../_cors';
import { requireAuth } from '../_auth';
import { getSupabase } from '../_supabase';

/**
 * POST /api/support/send-reply
 * Body: { thread_id, subject, body, recipient_email }
 *
 * Send an outbound reply to a support thread via Resend, preserving RFC 5322
 * threading headers (In-Reply-To, References) so the reply lands in the
 * original email thread in Gmail/Outlook/etc. Logs the outbound message to
 * `support_messages` and updates the thread status to 'waiting'.
 *
 * Plain text only — no HTML.
 */

interface ResendSuccess {
  id: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  const { thread_id, subject, body, recipient_email } = (req.body ?? {}) as {
    thread_id?: string;
    subject?: string;
    body?: string;
    recipient_email?: string;
  };

  if (!thread_id || !subject || !body || !recipient_email) {
    return res.status(400).json({
      error: 'thread_id, subject, body, recipient_email are required',
    });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'mathias@habos.ai';
  const replyTo = process.env.EMAIL_REPLY_TO || 'mathias@habos.ai';
  if (!resendKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY not set' });
  }

  try {
    const supabase = getSupabase();

    // Load the last inbound message for threading headers
    const { data: lastInbound } = await supabase
      .from('support_messages')
      .select('message_id, references_ids, subject')
      .eq('thread_id', thread_id)
      .eq('direction', 'inbound')
      .order('received_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const inReplyTo = (lastInbound?.message_id as string | null) || null;
    const priorRefs = (lastInbound?.references_ids as string[] | null) || [];
    const references = inReplyTo ? [...priorRefs, inReplyTo] : null;

    // Build the headers map for Resend (it supports custom headers)
    const customHeaders: Record<string, string> = {};
    if (inReplyTo) {
      customHeaders['In-Reply-To'] = inReplyTo.startsWith('<') ? inReplyTo : `<${inReplyTo}>`;
    }
    if (references && references.length > 0) {
      customHeaders['References'] = references
        .map((r) => (r.startsWith('<') ? r : `<${r}>`))
        .join(' ');
    }

    // Ensure subject carries "Re: " if we're replying
    const replySubject = /^re:\s/i.test(subject) ? subject : `Re: ${subject}`;

    const resendResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [recipient_email],
        subject: replySubject,
        text: body,
        reply_to: replyTo,
        headers: customHeaders,
      }),
    });

    const respText = await resendResp.text();
    if (!resendResp.ok) {
      console.error('[support/send-reply] resend error', resendResp.status, respText);
      return res.status(502).json({ error: 'Resend rejected the send', detail: respText });
    }

    let sendResult: ResendSuccess = { id: '' };
    try {
      sendResult = JSON.parse(respText);
    } catch {
      /* ignore */
    }

    const sentAt = new Date().toISOString();

    // Insert outbound message
    await supabase.from('support_messages').insert({
      thread_id,
      direction: 'outbound',
      from_email: replyTo,
      to_emails: [recipient_email],
      subject: replySubject,
      body_text: body,
      message_id: sendResult.id || null,
      in_reply_to: inReplyTo,
      references_ids: references,
    });

    // Update thread — status to waiting, last_message_at bumped
    await supabase
      .from('support_threads')
      .update({ status: 'waiting', last_message_at: sentAt })
      .eq('id', thread_id);

    return res.status(200).json({ ok: true, sent_at: sentAt });
  } catch (err: any) {
    console.error('[support/send-reply]', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}

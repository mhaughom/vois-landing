import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { setCors } from '../_cors';
import { requireAuth } from '../_auth';
import { getSupabase } from '../_supabase';
import {
  HABOS_EMAIL_TONE_GUIDE,
  retrieveContext,
} from '@li/shared/lib/habos-rag';

/**
 * POST /api/support/suggest-reply
 * Body: { message_id: string }
 *
 * Generates a Claude-drafted reply to an inbound support message, grounded
 * in the HABOS knowledge base (RAG_DOCS from shared/habos-rag). The
 * suggestion is cached on the inbound message row so subsequent loads of
 * the thread don't re-run the generation.
 */

const MODEL = 'claude-sonnet-4-6';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  const { message_id } = (req.body ?? {}) as { message_id?: string };
  if (!message_id) return res.status(400).json({ error: 'message_id required' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  try {
    const supabase = getSupabase();

    // Load the target message
    const { data: msg, error: msgErr } = await supabase
      .from('support_messages')
      .select('*')
      .eq('id', message_id)
      .maybeSingle();
    if (msgErr) throw msgErr;
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (msg.direction !== 'inbound') {
      return res.status(400).json({ error: 'Can only suggest replies to inbound messages' });
    }

    // Load last 5 messages in the thread for context
    const { data: recent, error: recentErr } = await supabase
      .from('support_messages')
      .select('direction, body_text, from_email, received_at')
      .eq('thread_id', msg.thread_id as string)
      .order('received_at', { ascending: false })
      .limit(5);
    if (recentErr) throw recentErr;

    const threadHistory = (recent ?? [])
      .slice()
      .reverse()
      .map((m) => {
        const who = m.direction === 'inbound' ? `From ${m.from_email}` : 'From Mathias';
        return `[${who}]\n${m.body_text}`;
      })
      .join('\n\n---\n\n');

    // Retrieve relevant HABOS knowledge from the message body
    const ragContext = retrieveContext(String(msg.body_text || ''), 8);

    const prompt = `${HABOS_EMAIL_TONE_GUIDE}

You are drafting a reply to an incoming email. Use the HABOS knowledge base below to ground every product claim. If the question is outside what the knowledge base supports, say so honestly and offer to have Mathias follow up personally — do NOT invent features, pricing, or capabilities.

<habos_knowledge>
${ragContext || '(no directly relevant features matched — be extra conservative about what you claim)'}
</habos_knowledge>

<thread_history>
${threadHistory}
</thread_history>

<latest_inbound_message>
Subject: ${msg.subject || '(no subject)'}
From: ${msg.from_email}

${msg.body_text}
</latest_inbound_message>

Write a reply to the latest inbound message.

HARD RULES:
- Plain text only. No markdown, no HTML, no links unless already referenced.
- Every product claim must be grounded in <habos_knowledge>. If the answer isn't there, say "let me get back to you on that" rather than guessing.
- Sound like Mathias wrote it — personal, direct, warm. Not a support bot.
- 2-4 short paragraphs. Under 150 words.
- No hype words (revolutionary, game-changing, world-class, cutting-edge, reimagine, unleash).
- No exclamation points.
- Sign off with "— Mathias".

Output ONLY the email body text (no JSON, no preamble, no commentary, no subject line).`;

    const anthropic = new Anthropic({ apiKey });
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const suggested = resp.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as any).text)
      .join('')
      .trim();

    // Cache the suggestion on the inbound message
    await supabase
      .from('support_messages')
      .update({
        ai_suggested_reply: suggested,
        ai_suggested_at: new Date().toISOString(),
      })
      .eq('id', message_id);

    return res.status(200).json({ suggested_reply: suggested });
  } catch (err: any) {
    console.error('[support/suggest-reply]', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}

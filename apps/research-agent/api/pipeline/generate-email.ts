import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { setCors } from '../_cors';
import { requireAuth } from '../_auth';
import { getSupabase } from '../_supabase';
import { CATEGORY_GUIDANCE, isCategory, type Category } from '../_category';

/**
 * POST /api/pipeline/generate-email
 * Body: { id: string, user_instructions?: string }
 *
 * Generates a personalized outbound email for a prospect. Plain text only —
 * no HTML, no tracking pixels (cold-outbound deliverability). Same approval
 * gate + fact/tone/emphasis structure as generate-hero. Email copy is written
 * to the prospect row AND logged to `prospect_generation_history`.
 *
 * Does NOT send — that's `/api/pipeline/send-email`.
 */

const MODEL = 'claude-sonnet-4-6';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  const { id, user_instructions } = (req.body ?? {}) as {
    id?: string;
    user_instructions?: string;
  };
  if (!id) return res.status(400).json({ error: 'id required' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  try {
    const supabase = getSupabase();
    const { data: row, error } = await supabase
      .from('personalized_pages')
      .select(
        'id, slug, company_name, industry, category, dossier, dossier_approved_at, hero_headline, hero_subline',
      )
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!row) return res.status(404).json({ error: 'Prospect not found' });

    if (!row.dossier_approved_at) {
      return res.status(409).json({
        error: 'research_required',
        message:
          'Dossier must be reviewed and approved before the outbound email can be generated.',
      });
    }

    const category: Category = isCategory(row.category) ? row.category : 'hybrid';
    const guidance = CATEGORY_GUIDANCE[category];
    const dossier = (row.dossier as Record<string, unknown>) || {};

    // Facts = dossier markdown sections only (no raw scrape).
    const factLines: string[] = [`Company: ${row.company_name}`];
    if (row.industry) factLines.push(`Industry: ${row.industry}`);
    if (dossier.overview_md) factLines.push(`\n## Overview\n${dossier.overview_md}`);
    if (dossier.positioning_md) factLines.push(`\n## Positioning\n${dossier.positioning_md}`);
    if (dossier.products_md) factLines.push(`\n## Products\n${dossier.products_md}`);
    if (dossier.stack_md) factLines.push(`\n## Stack\n${dossier.stack_md}`);
    if (dossier.leadership_md) factLines.push(`\n## Leadership\n${dossier.leadership_md}`);
    if (dossier.news_md) factLines.push(`\n## News\n${dossier.news_md}`);
    const facts = factLines.join('\n').substring(0, 8000);

    const landingUrl = `https://habos.ai/for/${row.slug}`;
    const heroLine = row.hero_headline
      ? `\nNote: the landing page hero headline is: "${row.hero_headline}". Don't repeat it verbatim in the email — the email should complement the page, not restate it.`
      : '';
    const emphasis = (user_instructions || '').trim() || '(none)';

    const prompt = `You are writing a COLD OUTBOUND EMAIL from Mathias (founder of HABOS) to a real person at ${row.company_name}.

HABOS is a human-to-agent business operating system that replaces the dozen fragmented tools businesses juggle today. Mathias is pitching ${row.company_name} specifically — this is 1:1 outbound, not a blast.

The email will be sent from mathias@habos.ai and links to a personalized landing page at ${landingUrl}.${heroLine}

<facts>
${facts}
</facts>

<tone_guidance>
Category: ${category}
${guidance}
</tone_guidance>

<emphasis>
${emphasis}
</emphasis>

HARD RULES (violations will be rejected):
- Plain text only. No HTML, no markdown, no images, no tracking pixel.
- Every claim must be grounded in <facts>. If a detail is not in <facts>, do not include it.
- <tone_guidance> shapes voice, not facts. <emphasis> shapes foregrounding, not facts.
- Sound like a real human wrote it. Contractions, short sentences, personal.
- No hype words: no "revolutionary", "game-changing", "world-class", "cutting-edge", "reimagine", "unleash", "supercharge", "next-gen", "excited to share".
- No exclamation points.
- No em-dashes as a replacement for verbs.
- No "Hope this email finds you well" or similar formulaic openers.
- Exactly one CTA: the ${landingUrl} link with a soft ask ("worth a 15-min look?" or similar — match tone).
- Body is 3-5 short paragraphs, 80-180 words total. Signed "— Mathias".
- Subject line is ≤8 words, specific, references something concrete from <facts>. No spammy words.

Output ONLY this JSON (no markdown fences, no commentary):
{
  "subject": "The subject line",
  "body": "The full plain-text body including greeting, paragraphs, CTA with the URL, and signature. Use \\n for line breaks."
}`;

    const anthropic = new Anthropic({ apiKey });
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = resp.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as any).text)
      .join('');

    let parsed: any = {};
    try {
      const fenced = text.match(/```json\s*([\s\S]*?)\s*```/);
      const braced = text.match(/\{[\s\S]*\}/);
      const jsonStr = fenced ? fenced[1] : braced ? braced[0] : text;
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.error('[generate-email] parse error', e, text.substring(0, 500));
      return res.status(502).json({ error: 'Failed to parse Claude output' });
    }

    const subject: string = parsed.subject || '';
    const body: string = parsed.body || '';
    if (!subject || !body) {
      return res.status(502).json({ error: 'Claude returned empty subject or body' });
    }

    const outputs = { subject, body };

    // History: flip previous current email row
    await supabase
      .from('prospect_generation_history')
      .update({ is_current: false })
      .eq('prospect_id', id)
      .eq('artifact_type', 'email')
      .eq('is_current', true);

    // Insert new history entry
    await supabase.from('prospect_generation_history').insert({
      prospect_id: id,
      artifact_type: 'email',
      brief: {
        category,
        category_guidance: guidance,
        dossier_snapshot: dossier,
        user_instructions: user_instructions || null,
        model: MODEL,
      },
      outputs,
      is_current: true,
    });

    // Update the prospect row
    const { data: updated, error: updateErr } = await supabase
      .from('personalized_pages')
      .update({
        email_subject: subject,
        email_body: body,
        email_generated_at: new Date().toISOString(),
        email_status: 'draft',
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;
    return res.status(200).json(updated);
  } catch (err: any) {
    console.error('[pipeline/generate-email]', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { setCors } from '../_cors';
import { requireAuth } from '../_auth';
import { getSupabase } from '../_supabase';
import { CATEGORY_GUIDANCE, isCategory, type Category } from '../_category';

/**
 * POST /api/pipeline/generate-hero
 * Body: { id: string, user_instructions?: string }
 *
 * Generates the 4 hero fields (eyebrow, headline, subline, cta_label) for a
 * prospect using a category-tuned prompt. HARD BLOCKS if the dossier has not
 * been explicitly approved — no generation from unreviewed research.
 *
 * The prompt uses explicit <facts>/<tone_guidance>/<emphasis> blocks so Claude
 * cannot fabricate facts from user instructions. Every run is logged to
 * `prospect_generation_history` with the full brief + outputs for debug and
 * rollback.
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
      .select('id, company_name, industry, category, dossier, dossier_approved_at')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!row) return res.status(404).json({ error: 'Prospect not found' });

    // ── APPROVAL GATE — no generation without reviewed/approved research ──
    if (!row.dossier_approved_at) {
      return res.status(409).json({
        error: 'research_required',
        message:
          'Dossier must be reviewed and approved before the hero can be generated.',
      });
    }

    const category: Category = isCategory(row.category) ? row.category : 'hybrid';
    const guidance = CATEGORY_GUIDANCE[category];
    const dossier = (row.dossier as Record<string, unknown>) || {};

    // Build the <facts> block from dossier markdown sections ONLY.
    // Raw metadata and scraped_pages are Claude's scratchpad, not reviewed
    // content, so they deliberately do NOT appear as facts.
    const factLines: string[] = [`Company: ${row.company_name}`];
    if (row.industry) factLines.push(`Industry: ${row.industry}`);
    if (dossier.overview_md) factLines.push(`\n## Overview\n${dossier.overview_md}`);
    if (dossier.positioning_md) factLines.push(`\n## Positioning\n${dossier.positioning_md}`);
    if (dossier.products_md) factLines.push(`\n## Products\n${dossier.products_md}`);
    if (dossier.stack_md) factLines.push(`\n## Stack\n${dossier.stack_md}`);
    if (dossier.leadership_md) factLines.push(`\n## Leadership\n${dossier.leadership_md}`);
    if (dossier.news_md) factLines.push(`\n## News\n${dossier.news_md}`);
    const facts = factLines.join('\n').substring(0, 8000);

    const emphasis = (user_instructions || '').trim() || '(none)';

    const prompt = `You are writing the HERO SECTION of a personalized landing page for ${row.company_name}. The landing page is for HABOS — a human-to-agent business operating system that replaces the dozen fragmented tools businesses juggle today.

You are ONLY writing 4 fields: hero_eyebrow, hero_headline, hero_subline, hero_cta_label. The rest of the page is already built. Your job is to make the first 3 seconds specific, concrete, and unmistakably for ${row.company_name}.

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
- Every claim in your output must be grounded in <facts>. If a detail is not in <facts>, you may not include it.
- <tone_guidance> shapes voice and word choice, not what facts exist.
- <emphasis> tells you which facts to foreground or de-emphasize, NOT what facts exist. If <emphasis> requests a fact not in <facts>, ignore that request rather than inventing.
- No hype words: no "revolutionary", "game-changing", "world-class", "cutting-edge", "reimagine", "unleash", "supercharge", "next-gen".
- No exclamation points.
- No em-dashes as a replacement for verbs.
- Be specific to ${row.company_name}. If the copy would also work for a competitor, rewrite it.

Output ONLY this JSON (no markdown fences, no commentary):
{
  "hero_eyebrow": "Short label, max 6 words, e.g. 'For ${row.company_name}'",
  "hero_headline": "Punchy, specific, max 12 words. References ${row.company_name}'s actual situation from <facts>.",
  "hero_subline": "One sentence, 15-25 words. Concrete. No marketing fluff.",
  "hero_cta_label": "Short CTA button text, max 5 words. Matches the category tone."
}`;

    const anthropic = new Anthropic({ apiKey });
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
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
      console.error('[generate-hero] parse error', e, text.substring(0, 500));
      return res.status(502).json({ error: 'Failed to parse Claude output' });
    }

    const outputs = {
      hero_eyebrow: parsed.hero_eyebrow || null,
      hero_headline: parsed.hero_headline || null,
      hero_subline: parsed.hero_subline || null,
      hero_cta_label: parsed.hero_cta_label || 'Book a walkthrough',
    };

    // 1. Flip any previous `is_current=true` hero history row for this prospect
    await supabase
      .from('prospect_generation_history')
      .update({ is_current: false })
      .eq('prospect_id', id)
      .eq('artifact_type', 'hero')
      .eq('is_current', true);

    // 2. Insert the new history entry with the full brief + outputs
    const { error: historyErr } = await supabase
      .from('prospect_generation_history')
      .insert({
        prospect_id: id,
        artifact_type: 'hero',
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
    if (historyErr) {
      console.error('[generate-hero] history insert error', historyErr);
      // Don't fail the request — the main row update is still the source of truth.
    }

    // 3. Update the prospect row with the new hero fields + ready status
    const { data: updated, error: updateErr } = await supabase
      .from('personalized_pages')
      .update({ ...outputs, status: 'ready' })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;
    return res.status(200).json(updated);
  } catch (err: any) {
    console.error('[pipeline/generate-hero]', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}

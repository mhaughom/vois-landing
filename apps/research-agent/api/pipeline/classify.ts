import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { setCors } from '../_cors';
import { requireAuth } from '../_auth';
import { getSupabase } from '../_supabase';

/**
 * POST /api/pipeline/classify
 * Body: { id: string }
 *
 * Asks Claude to read the dossier and classify the prospect into one of four
 * pitch categories: investor | blue-collar | white-collar | hybrid.
 * The classification becomes the category hint for the generate-hero step.
 */

const CATEGORIES = ['investor', 'blue-collar', 'white-collar', 'hybrid'] as const;
type Category = (typeof CATEGORIES)[number];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  const { id } = (req.body ?? {}) as { id?: string };
  if (!id) return res.status(400).json({ error: 'id required' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  try {
    const supabase = getSupabase();
    const { data: row, error } = await supabase
      .from('personalized_pages')
      .select('company_name, industry, company_size, dossier')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!row) return res.status(404).json({ error: 'Prospect not found' });

    const dossier = (row.dossier as Record<string, unknown>) || {};
    const summary = [
      `Company: ${row.company_name}`,
      `Industry: ${row.industry || 'unknown'}`,
      `Size: ${row.company_size || 'unknown'}`,
      dossier.overview_md ? `\nOverview:\n${dossier.overview_md}` : '',
      dossier.products_md ? `\nProducts:\n${dossier.products_md}` : '',
      dossier.positioning_md ? `\nPositioning:\n${dossier.positioning_md}` : '',
    ]
      .filter(Boolean)
      .join('\n')
      .substring(0, 6000);

    const prompt = `You are classifying a company to choose the right pitch angle for a personalized HABOS outbound landing page.

HABOS is a human-to-agent business operating system that replaces the dozen fragmented tools businesses juggle (scheduling, dispatch, CRM, invoicing, marketing, etc).

CATEGORIES:
- **investor** — VCs, angels, strategics, funds. Want category thesis + traction + team + why-now. Don't care about operational minutiae. Clues: portfolio companies, fund/capital language, thesis posts, partner bios.
- **blue-collar** — Hands-on trades operators (plumbing, electrical, HVAC, contractors, cleaning, field service, landscaping). Plain-spoken. Money and hours are the only metrics that matter. Skeptical of hype. Clues: service area maps, trade-specific terminology, "24/7 emergency" language, licensed/insured badges.
- **white-collar** — Knowledge-worker ops leads at SMB or mid-market. Consultative tone. Care about outcomes, integrations, workflow. Clues: agency language, SaaS language, case studies with ROI numbers, team/department structure.
- **hybrid** — Founders/operators who span multiple worlds, or whose business mixes blue-collar execution with white-collar processes (e.g. multi-location trades, franchise operators, tech-enabled services). When uncertain, prefer hybrid over a bad fit.

Return ONLY JSON, no markdown, no commentary:
{ "category": "investor" | "blue-collar" | "white-collar" | "hybrid", "reason": "one sentence explaining why" }

COMPANY:
${summary}`;

    const anthropic = new Anthropic({ apiKey });
    const resp = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = resp.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as any).text)
      .join('');

    let category: Category = 'hybrid';
    let reason = 'Defaulted to hybrid — no strong signal in the dossier.';
    try {
      const match = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : text);
      if (CATEGORIES.includes(parsed.category)) category = parsed.category;
      if (typeof parsed.reason === 'string') reason = parsed.reason;
    } catch (e) {
      console.error('[classify] parse error', e, text.substring(0, 300));
    }

    await supabase
      .from('personalized_pages')
      .update({ category, category_reason: reason })
      .eq('id', id);

    return res.status(200).json({ category, reason });
  } catch (err: any) {
    console.error('[pipeline/classify]', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}

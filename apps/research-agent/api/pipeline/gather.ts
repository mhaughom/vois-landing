import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { setCors } from '../_cors';
import { requireAuth } from '../_auth';
import { getSupabase } from '../_supabase';

/**
 * POST /api/pipeline/gather
 * Body: { company_url: string, company_name?: string }
 *
 * The "research" step. Scrapes the homepage + up to 3 subpages, fetches a
 * Clearbit logo, uploads it to the `research-dossiers` Storage bucket, then
 * asks Claude to synthesize markdown sections from the raw scraped text.
 * Creates (or updates) a `personalized_pages` row and returns it.
 *
 * This is the only pipeline step that can take 20-60 seconds — it runs
 * sequential HTTP fetches + 1 large Claude call.
 */

// ─── Helpers ────────────────────────────────────────────────────────────

function slugify(name: string): string {
  const s = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 64);
  return s || `prospect-${Date.now()}`;
}

function normalizeUrl(url: string): string {
  return url.startsWith('http') ? url : `https://${url}`;
}

function extractDomain(url: string): string {
  try {
    const u = new URL(normalizeUrl(url));
    return u.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

// Regex-based metadata extraction — zero deps.
function extractMetadata(html: string) {
  const getMeta = (nameOrProp: string) => {
    const re = new RegExp(
      `<meta[^>]*(?:name|property)=["']${nameOrProp}["'][^>]*content=["']([^"']*)["']`,
      'i',
    );
    return html.match(re)?.[1];
  };
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return {
    title: titleMatch?.[1]?.trim(),
    description: getMeta('description'),
    og_title: getMeta('og:title'),
    og_description: getMeta('og:description'),
    og_image: getMeta('og:image'),
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findInterestingLinks(html: string, baseUrl: string): string[] {
  const linkRe = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
  const pattern = /\b(about|team|leadership|company|product|platform|solution|why|how|mission)\b/i;
  const base = new URL(baseUrl);
  const seen = new Set<string>();
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(html)) !== null && out.length < 5) {
    const href = m[1];
    const text = m[2] || '';
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      continue;
    }
    if (!pattern.test(href) && !pattern.test(text)) continue;
    try {
      const abs = new URL(href, baseUrl).href;
      if (new URL(abs).hostname !== base.hostname) continue;
      if (seen.has(abs) || abs === baseUrl) continue;
      seen.add(abs);
      out.push(abs);
    } catch {
      /* bad URL */
    }
  }
  return out;
}

async function fetchPage(url: string, timeoutMs = 8000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HABOSResearchBot/1.0; +https://habos.ai)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    if (!res.ok) return '';
    return await res.text();
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

async function downloadImage(
  url: string,
): Promise<{ buffer: ArrayBuffer; contentType: string } | null> {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || 'image/png';
    const buffer = await res.arrayBuffer();
    return { buffer, contentType };
  } catch {
    return null;
  }
}

// ─── Main handler ───────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  const { company_url, company_name } = (req.body ?? {}) as {
    company_url?: string;
    company_name?: string;
  };

  if (!company_url) return res.status(400).json({ error: 'company_url required' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  const url = normalizeUrl(company_url);
  const domain = extractDomain(url);
  if (!domain) return res.status(400).json({ error: 'Invalid URL' });

  const supabase = getSupabase();

  try {
    // 1. Fetch homepage
    const homepage = await fetchPage(url);
    if (!homepage) {
      return res.status(502).json({ error: `Could not fetch ${url}` });
    }

    const meta = extractMetadata(homepage);
    const homeText = stripHtml(homepage).substring(0, 6000);

    // 2. Fetch 2-3 interesting subpages in parallel
    const links = findInterestingLinks(homepage, url).slice(0, 3);
    const subPages = await Promise.all(
      links.map(async (link) => {
        const html = await fetchPage(link);
        return {
          url: link,
          title: extractMetadata(html).title,
          excerpt: stripHtml(html).substring(0, 3000),
        };
      }),
    );

    // 3. Derive a company name
    const resolvedName =
      (company_name && company_name.trim()) ||
      meta.og_title ||
      meta.title?.split(/[-|–—:]/)[0].trim() ||
      domain.split('.')[0];

    const slug = slugify(resolvedName);

    // 4. Upsert draft row (set status = researching)
    const { data: existing } = await supabase
      .from('personalized_pages')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    let prospectId: string;
    if (existing) {
      prospectId = existing.id as string;
      await supabase
        .from('personalized_pages')
        .update({ status: 'researching', company_url: url })
        .eq('id', prospectId);
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from('personalized_pages')
        .insert({
          slug,
          status: 'researching',
          company_name: resolvedName,
          company_domain: domain,
          company_url: url,
        })
        .select('id')
        .single();
      if (insertErr) throw insertErr;
      prospectId = inserted.id as string;
    }

    // 5. Fetch + upload Clearbit logo (fail-soft — missing logo is fine)
    let logoUrl: string | null = null;
    const logoData = await downloadImage(`https://logo.clearbit.com/${domain}`);
    if (logoData) {
      const ct = logoData.contentType.toLowerCase();
      const ext = ct.includes('svg') ? 'svg' : ct.includes('jpeg') || ct.includes('jpg') ? 'jpg' : 'png';
      const path = `${slug}/logo.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('research-dossiers')
        .upload(path, logoData.buffer, {
          contentType: logoData.contentType,
          upsert: true,
        });
      if (!uploadErr) {
        const { data: publicUrl } = supabase.storage.from('research-dossiers').getPublicUrl(path);
        logoUrl = publicUrl.publicUrl;
      }
    }

    // 6. Ask Claude to synthesize the dossier as structured JSON
    const anthropic = new Anthropic({ apiKey });

    const rawText = [
      `HOMEPAGE [${url}]`,
      `Title: ${meta.title || ''}`,
      `Description: ${meta.description || ''}`,
      `OG Title: ${meta.og_title || ''}`,
      `OG Description: ${meta.og_description || ''}`,
      '',
      'HOMEPAGE CONTENT:',
      homeText,
      '',
      ...subPages
        .filter((p) => p.excerpt)
        .map((p) => `SUBPAGE [${p.url}]${p.title ? ` — ${p.title}` : ''}:\n${p.excerpt}`),
    ].join('\n\n');

    const synthesisPrompt = `You are a business research analyst building a dossier for "${resolvedName}" from scraped web content. The dossier will be used to personalize a sales outreach page, so be concrete and honest about what the content actually says.

Return ONLY a JSON object with this exact shape (no markdown fences, no commentary):
{
  "overview_md": "2-3 paragraphs in markdown: what the company does, who it serves, where it operates.",
  "leadership_md": "Markdown: any named founders/leaders/team members mentioned. If none found, say 'No leadership information was available in the scraped pages.'",
  "products_md": "Markdown bulleted list of products/services offered. Be specific — product names, not categories.",
  "positioning_md": "1-2 markdown paragraphs: how they position themselves, their value prop, their differentiators.",
  "stack_md": "Markdown: any tools, technologies, or integrations mentioned. If none, say so.",
  "news_md": "Markdown: recent announcements, launches, funding, or press mentioned. If none, say so.",
  "industry": "One short phrase (e.g. 'B2B SaaS', 'Field service', 'Fintech', 'Healthcare IT')",
  "company_size": "One of: 'solo', '2-10', '11-50', '51-200', '200+', or 'unknown'",
  "stack_hints": ["array", "of", "tool", "names", "mentioned"]
}

Rules:
- If a field has no supporting content, say so honestly. Do NOT make things up.
- Each markdown section under 300 words.
- Quote directly from the content where it's specific and useful.

SCRAPED CONTENT:
${rawText.substring(0, 20000)}`;

    const synthesisResp = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: synthesisPrompt }],
    });

    const responseText = synthesisResp.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as any).text)
      .join('');

    let parsed: any = {};
    try {
      const fenced = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      const braced = responseText.match(/(\{[\s\S]*\})/);
      const jsonStr = fenced ? fenced[1] : braced ? braced[1] : responseText;
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.error('[gather] Claude output parse error', e, responseText.substring(0, 500));
      parsed = { overview_md: responseText.substring(0, 2000) };
    }

    // 7. Build dossier + update row
    const dossier = {
      overview_md: parsed.overview_md || '',
      leadership_md: parsed.leadership_md || '',
      products_md: parsed.products_md || '',
      positioning_md: parsed.positioning_md || '',
      stack_md: parsed.stack_md || '',
      news_md: parsed.news_md || '',
      raw_metadata: meta,
      scraped_pages: [
        { url, title: meta.title, excerpt: homeText.substring(0, 500) },
        ...subPages
          .filter((p) => p.excerpt)
          .map((p) => ({
            url: p.url,
            title: p.title,
            excerpt: p.excerpt.substring(0, 500),
          })),
      ],
      image_urls: logoUrl ? { logo: logoUrl } : {},
      stack_hints: Array.isArray(parsed.stack_hints) ? parsed.stack_hints : [],
      dossier_generated_at: new Date().toISOString(),
    };

    const { data: updated, error: updateErr } = await supabase
      .from('personalized_pages')
      .update({
        company_name: resolvedName,
        company_logo_url: logoUrl,
        industry: parsed.industry || null,
        company_size: parsed.company_size || null,
        dossier,
        // Re-gathering invalidates any prior approval — the new content hasn't
        // been reviewed yet, so generate-hero / generate-email should be blocked
        // until the user explicitly re-approves.
        dossier_approved_at: null,
        status: 'draft',
      })
      .eq('id', prospectId)
      .select()
      .single();

    if (updateErr) throw updateErr;
    return res.status(200).json(updated);
  } catch (err: any) {
    console.error('[pipeline/gather]', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getCorsOrigin } from '../_cors';

/**
 * POST /api/personalized/track
 *
 * Records a tracking event for a personalized landing page. Uses the Supabase
 * service-role key so it bypasses RLS (the `personalized_page_events` table has
 * no anon policies). Fire-and-forget from the client; never blocks page render.
 *
 * Required env:
 *   SUPABASE_URL (or VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 */

// ─── Rate limit: 60 events/min per IP (per serverless instance) ─────────────
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

const SLUG_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
const VALID_EVENTS = new Set([
  'view',
  'scroll_25',
  'scroll_50',
  'scroll_75',
  'scroll_100',
  'cta_click',
  'calendly_open',
  'stack_tool_clicked',
  'section_viewed',
]);

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — configure in Vercel env',
    );
  }
  _supabase = createClient(url, key, { auth: { persistSession: false } });
  return _supabase;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  const origin = getCorsOrigin(req);
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limit
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many events' });
  }

  const body = (req.body ?? {}) as {
    slug?: string;
    event_type?: string;
    metadata?: Record<string, unknown>;
    referer?: string;
  };
  const { slug, event_type, metadata = {}, referer } = body;

  if (!slug || !SLUG_RE.test(slug)) {
    return res.status(400).json({ error: 'Invalid slug' });
  }
  if (!event_type || !VALID_EVENTS.has(event_type)) {
    return res.status(400).json({ error: 'Invalid event_type' });
  }

  try {
    const supabase = getSupabase();

    // Look up the page (must exist — 404 if the slug is bogus)
    const { data: page, error: pageError } = await supabase
      .from('personalized_pages')
      .select('id, view_count, first_viewed_at')
      .eq('slug', slug)
      .maybeSingle();

    if (pageError) {
      console.error('[personalized-track] lookup error', pageError);
      return res.status(500).json({ error: 'Lookup failed' });
    }
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Enrich with Vercel edge headers
    const country = (req.headers['x-vercel-ip-country'] as string) || undefined;
    const city = (req.headers['x-vercel-ip-city'] as string) || undefined;
    const userAgent = (req.headers['user-agent'] as string) || undefined;

    const utmSource = typeof metadata.utm_source === 'string' ? metadata.utm_source : undefined;
    const utmMedium = typeof metadata.utm_medium === 'string' ? metadata.utm_medium : undefined;
    const utmCampaign = typeof metadata.utm_campaign === 'string' ? metadata.utm_campaign : undefined;

    const { error: insertError } = await supabase.from('personalized_page_events').insert({
      page_id: page.id as string,
      slug,
      event_type,
      metadata,
      country,
      city,
      user_agent: userAgent,
      referer,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
    });

    if (insertError) {
      console.error('[personalized-track] insert error', insertError);
      return res.status(500).json({ error: 'Insert failed' });
    }

    // For view events, bump aggregates on the parent row.
    if (event_type === 'view') {
      const now = new Date().toISOString();
      const updatePayload: Record<string, unknown> = {
        view_count: ((page.view_count as number | null) ?? 0) + 1,
        last_viewed_at: now,
      };
      if (!page.first_viewed_at) updatePayload.first_viewed_at = now;
      const { error: updateError } = await supabase
        .from('personalized_pages')
        .update(updatePayload)
        .eq('id', page.id as string);
      if (updateError) {
        console.error('[personalized-track] update error', updateError);
        // Don't fail the request; event insert succeeded.
      }
    }

    return res.status(204).end();
  } catch (err) {
    console.error('[personalized-track] error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}

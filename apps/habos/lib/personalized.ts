import { supabase } from '@li/shared/lib/supabase';

// ─── Types — mirror `personalized_pages` row shape ─────────────────────────
export type ProspectStatus = 'draft' | 'researching' | 'ready' | 'published' | 'archived';
export type ProspectCategory = 'investor' | 'blue-collar' | 'white-collar' | 'hybrid';

export interface ResearchDossier {
  overview_md?: string;
  leadership_md?: string;
  products_md?: string;
  positioning_md?: string;
  stack_md?: string;
  news_md?: string;
  raw_metadata?: {
    title?: string;
    description?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
  };
  scraped_pages?: Array<{ url: string; title?: string; excerpt?: string }>;
  image_urls?: Record<string, string>;
  stack_hints?: string[];
}

export interface PersonalizedProspect {
  id: string;
  slug: string;
  status: ProspectStatus;

  company_name: string;
  company_domain: string | null;
  company_url: string | null;
  company_logo_url: string | null;
  industry: string | null;
  company_size: string | null;

  category: ProspectCategory | null;
  category_reason: string | null;

  dossier: ResearchDossier;

  hero_eyebrow: string | null;
  hero_headline: string | null;
  hero_subline: string | null;
  hero_video_url: string | null;
  hero_image_url: string | null;
  hero_cta_label: string;
  hero_cta_url: string | null;

  created_at: string;
  updated_at: string;
  published_at: string | null;
}

// ─── Slug validation — mirrors DB CHECK constraint ─────────────────────────
const SLUG_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

// ─── Public fetch (anon key + RLS hides drafts) ────────────────────────────
export async function getPersonalizedPage(slug: string): Promise<PersonalizedProspect | null> {
  const { data, error } = await supabase
    .from('personalized_pages')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('[personalized] fetch error', error);
    return null;
  }
  return (data as PersonalizedProspect | null) ?? null;
}

// ─── Fire-and-forget event tracking ────────────────────────────────────────
export type PersonalizedEvent =
  | 'view' | 'scroll_25' | 'scroll_50' | 'scroll_75' | 'scroll_100'
  | 'cta_click' | 'calendly_open' | 'section_viewed';

export function trackPersonalizedEvent(
  slug: string,
  event: PersonalizedEvent,
  metadata: Record<string, unknown> = {},
): void {
  if (typeof window === 'undefined') return;
  try {
    fetch('/api/personalized/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        event_type: event,
        metadata,
        referer: document.referrer || undefined,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* never throw from tracking */
  }
}

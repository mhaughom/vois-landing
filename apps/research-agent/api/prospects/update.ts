import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCors } from '../_cors';
import { requireAuth } from '../_auth';
import { getSupabase } from '../_supabase';

/**
 * POST /api/prospects/update
 * Body: { id: string, patch: Partial<PersonalizedProspect> }
 *
 * Whitelisted update — only writable fields are allowed through, so the
 * client can't accidentally (or maliciously) mutate id/slug/created_at/etc.
 */
const ALLOWED_FIELDS = new Set([
  'company_name',
  'company_domain',
  'company_url',
  'company_logo_url',
  'industry',
  'company_size',
  'category',
  'category_reason',
  'dossier',
  'dossier_approved_at',
  'hero_eyebrow',
  'hero_headline',
  'hero_subline',
  'hero_video_url',
  'hero_image_url',
  'hero_cta_label',
  'hero_cta_url',
  'recipient_email',
  'email_subject',
  'email_body',
  'email_status',
  'status',
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  const { id, patch } = (req.body ?? {}) as {
    id?: string;
    patch?: Record<string, unknown>;
  };

  if (!id || !patch || typeof patch !== 'object') {
    return res.status(400).json({ error: 'id and patch required' });
  }

  const sanitized: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    if (ALLOWED_FIELDS.has(k)) sanitized[k] = v;
  }
  if (Object.keys(sanitized).length === 0) {
    return res.status(400).json({ error: 'No valid fields in patch' });
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('personalized_pages')
      .update(sanitized)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('[prospects/update]', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}

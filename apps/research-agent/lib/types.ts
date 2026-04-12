// Mirrors the `personalized_pages` row shape — kept duplicated from
// apps/habos/lib/personalized.ts to avoid a shared-package dependency for
// types only. The DB schema is the single source of truth.

export type ProspectStatus =
  | 'draft'
  | 'researching'
  | 'ready'
  | 'published'
  | 'archived';

export type ProspectCategory =
  | 'investor'
  | 'blue-collar'
  | 'white-collar'
  | 'hybrid';

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
  /** Set by gather.ts on each run. Used for the staleness warning (>60 days). */
  dossier_generated_at?: string;
}

export type EmailStatus = 'not_started' | 'draft' | 'sent';
export type ArtifactType = 'hero' | 'email';

export interface GenerationBrief {
  category?: string | null;
  category_guidance?: string;
  dossier_snapshot?: ResearchDossier;
  user_instructions?: string | null;
  model?: string;
}

export interface HeroOutputs {
  hero_eyebrow: string | null;
  hero_headline: string | null;
  hero_subline: string | null;
  hero_cta_label: string;
}

export interface EmailOutputs {
  subject: string;
  body: string;
}

export interface GenerationHistoryEntry {
  id: string;
  prospect_id: string;
  artifact_type: ArtifactType;
  brief: GenerationBrief;
  outputs: HeroOutputs | EmailOutputs | Record<string, unknown>;
  generated_at: string;
  is_current: boolean;
}

// ─── Support inbox (Phase D) ────────────────────────────────────────────

export type SupportThreadStatus = 'unread' | 'open' | 'waiting' | 'closed';
export type SupportMessageDirection = 'inbound' | 'outbound';

export interface SupportThread {
  id: string;
  subject: string | null;
  from_email: string;
  from_name: string | null;
  status: SupportThreadStatus;
  prospect_id: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  thread_id: string;
  direction: SupportMessageDirection;
  from_email: string;
  to_emails: string[];
  cc_emails: string[];
  subject: string | null;
  body_text: string;
  body_html: string | null;
  message_id: string | null;
  in_reply_to: string | null;
  references_ids: string[] | null;
  ai_suggested_reply: string | null;
  ai_suggested_at: string | null;
  received_at: string;
}

export interface SupportThreadWithMessages extends SupportThread {
  messages: SupportMessage[];
  prospect?: Pick<PersonalizedProspect, 'id' | 'slug' | 'company_name'> | null;
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
  /** Set by the "Approve dossier" UI button. Generate-hero/email hard-block until set. */
  dossier_approved_at: string | null;

  hero_eyebrow: string | null;
  hero_headline: string | null;
  hero_subline: string | null;
  hero_video_url: string | null;
  hero_image_url: string | null;
  hero_cta_label: string;
  hero_cta_url: string | null;

  /** Phase C: outbound email fields */
  recipient_email: string | null;
  email_subject: string | null;
  email_body: string | null;
  email_generated_at: string | null;
  email_sent_at: string | null;
  email_status: EmailStatus;

  created_at: string;
  updated_at: string;
  published_at: string | null;
  view_count: number;
}

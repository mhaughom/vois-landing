-- Personalized landing pages (hero-swap variant of the main Work page).
-- Route: habos.ai/for/:slug — renders the full Work page with a prospect-specific hero.
-- Drafts are hidden from anon via RLS; only `status = 'published'` rows are readable.

create table if not exists personalized_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'),
  status text not null default 'draft' check (status in (
    'draft', 'researching', 'ready', 'published', 'archived'
  )),

  -- Company facts (filled by research-agent gather step)
  company_name text not null,
  company_domain text,
  company_url text,
  company_logo_url text,
  industry text,
  company_size text,

  -- Auto-classified by the research-agent classify step. Text not enum so new
  -- categories can be added without a migration; the set is governed in code.
  category text,
  category_reason text,

  -- Rich research dossier — markdown sections + raw metadata + image URLs.
  -- Shape (all keys optional, all filled progressively by the pipeline):
  --   { overview_md, leadership_md, products_md, positioning_md, stack_md,
  --     news_md, raw_metadata: {...}, scraped_pages: [...], image_urls: {...},
  --     stack_hints: ['Salesforce', ...] }
  dossier jsonb not null default '{}'::jsonb,

  -- Custom hero content (the only thing that appears on the public page).
  -- Everything else on /for/:slug is the default Work.tsx page.
  hero_eyebrow text,
  hero_headline text,
  hero_subline text,
  hero_video_url text,
  hero_image_url text,
  hero_cta_label text not null default 'Book a walkthrough',
  hero_cta_url text,

  -- Meta
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,

  -- Tracking aggregates (detailed events live in personalized_page_events)
  view_count int not null default 0,
  first_viewed_at timestamptz,
  last_viewed_at timestamptz
);

create index if not exists idx_personalized_pages_slug on personalized_pages(slug);
create index if not exists idx_personalized_pages_status on personalized_pages(status);
create index if not exists idx_personalized_pages_category on personalized_pages(category);

-- RLS: anon reads only published. service_role bypasses.
alter table personalized_pages enable row level security;

drop policy if exists "Anon reads published personalized pages" on personalized_pages;
create policy "Anon reads published personalized pages" on personalized_pages
  for select to anon using (status = 'published');

-- updated_at trigger
create or replace function update_personalized_pages_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_personalized_pages_updated_at on personalized_pages;
create trigger trg_personalized_pages_updated_at
  before update on personalized_pages
  for each row execute function update_personalized_pages_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Event log (write-only from /api/personalized/track via service role)
create table if not exists personalized_page_events (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references personalized_pages(id) on delete cascade,
  slug text not null,
  event_type text not null check (event_type in (
    'view', 'scroll_25', 'scroll_50', 'scroll_75', 'scroll_100',
    'cta_click', 'calendly_open', 'section_viewed'
  )),
  metadata jsonb not null default '{}'::jsonb,
  country text,
  city text,
  user_agent text,
  referer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

create index if not exists idx_pp_events_page_created
  on personalized_page_events(page_id, created_at desc);
create index if not exists idx_pp_events_slug_created
  on personalized_page_events(slug, created_at desc);

alter table personalized_page_events enable row level security;
-- No anon policies = denied by default.

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage bucket for dossier images (logos, team photos, product shots).
-- Public read so the /for/:slug page can display them without signed URLs.
insert into storage.buckets (id, name, public)
  values ('research-dossiers', 'research-dossiers', true)
  on conflict (id) do nothing;

-- Allow anon to read from the bucket (public assets)
drop policy if exists "Anon can read research-dossiers" on storage.objects;
create policy "Anon can read research-dossiers" on storage.objects
  for select to anon using (bucket_id = 'research-dossiers');

-- Service role writes (via research-agent pipeline) bypass RLS automatically.

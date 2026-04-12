-- Research Agent V1.1: approval gate, generation history, outbound email, support inbox
-- Covers Phases A, C, D of the V1.1 plan. Applied as a single migration so the
-- schema is coherent even if the UI ships phased.

-- ─────────────────────────────────────────────────────────────────────────────
-- PHASE A: research improvements

alter table personalized_pages
  add column if not exists dossier_approved_at timestamptz;

-- PHASE C: outbound email fields (stored inline for fast reads; history goes
-- to prospect_generation_history below)
alter table personalized_pages
  add column if not exists recipient_email text,
  add column if not exists email_subject text,
  add column if not exists email_body text,
  add column if not exists email_generated_at timestamptz,
  add column if not exists email_sent_at timestamptz,
  add column if not exists email_status text not null default 'not_started'
    check (email_status in ('not_started', 'draft', 'sent'));

-- ─────────────────────────────────────────────────────────────────────────────
-- Generation history — append-only log of every hero/email generation with
-- its full brief (inputs) and outputs. Enables rollback + debug.

create table if not exists prospect_generation_history (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references personalized_pages(id) on delete cascade,
  artifact_type text not null check (artifact_type in ('hero', 'email')),

  -- Brief: every input that shaped the output
  -- Shape: { category, category_guidance, dossier_snapshot, user_instructions, model }
  brief jsonb not null,

  -- Outputs
  -- hero:  { hero_eyebrow, hero_headline, hero_subline, hero_cta_label }
  -- email: { subject, body }
  outputs jsonb not null,

  generated_at timestamptz not null default now(),
  is_current boolean not null default false
);

create index if not exists idx_pgh_prospect_type_time
  on prospect_generation_history(prospect_id, artifact_type, generated_at desc);

create index if not exists idx_pgh_current
  on prospect_generation_history(prospect_id, artifact_type)
  where is_current = true;

alter table prospect_generation_history enable row level security;
-- No anon policies — service role only.

-- ─────────────────────────────────────────────────────────────────────────────
-- PHASE D: support inbox (inbound mail via Cloudflare Email Routing webhook)

create table if not exists support_threads (
  id uuid primary key default gen_random_uuid(),
  subject text,
  from_email text not null,
  from_name text,
  status text not null default 'unread'
    check (status in ('unread', 'open', 'waiting', 'closed')),
  -- Auto-link a support thread to a prospect if the sender matches
  prospect_id uuid references personalized_pages(id) on delete set null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_support_threads_status_last
  on support_threads(status, last_message_at desc);
create index if not exists idx_support_threads_from on support_threads(from_email);
create index if not exists idx_support_threads_prospect on support_threads(prospect_id);

create table if not exists support_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references support_threads(id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  from_email text not null,
  to_emails text[] not null default array[]::text[],
  cc_emails text[] not null default array[]::text[],
  subject text,
  body_text text not null,
  body_html text,

  -- Threading headers for RFC 5322 proper replies
  message_id text,        -- Message-ID header of this message
  in_reply_to text,       -- In-Reply-To header (points to parent's Message-ID)
  references_ids text[],  -- References header (chain)

  -- AI reply suggestion cache (inbound only)
  ai_suggested_reply text,
  ai_suggested_at timestamptz,

  received_at timestamptz not null default now()
);

create index if not exists idx_support_messages_thread_time
  on support_messages(thread_id, received_at);
create index if not exists idx_support_messages_message_id
  on support_messages(message_id)
  where message_id is not null;

alter table support_threads enable row level security;
alter table support_messages enable row level security;
-- No anon policies — service role only.

-- updated_at trigger for support_threads
create or replace function update_support_threads_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_support_threads_updated_at on support_threads;
create trigger trg_support_threads_updated_at
  before update on support_threads
  for each row execute function update_support_threads_updated_at();

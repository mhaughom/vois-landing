# Research Agent

Internal single-user tool for generating personalized outbound and handling AI-assisted support email for HABOS.

## What this is

A scrappy CRM-flavored workflow that:
1. Scrapes a prospect's website
2. Synthesizes a dossier with Claude (overview, leadership, products, positioning, stack, news)
3. Classifies the prospect into a pitch category (investor / blue-collar / white-collar / hybrid)
4. Generates a personalized hero for `habos.ai/for/:slug`
5. Generates a personalized cold outbound email
6. Sends the email via Resend
7. Catches inbound replies + support mail via Cloudflare Email Routing and suggests replies grounded in the HABOS product knowledge base

## What this is NOT — deliberately out of scope

This is a tool for Mathias, not a product feature. Scope is kept narrow on purpose.

- **No self-hosted mail server.** Cloudflare Email Routing + Resend covers inbound and outbound.
- **No HTML emails or tracking pixels.** Plain text only. Cold-outbound deliverability depends on it, and it looks like a real human reached out.
- **No open-rate or link-click tracking.** Use reply rate as the signal instead.
- **No multi-user support.** Single password, single user.
- **No A/B testing** of hero or email copy.
- **No bulk import from CSV.** One prospect at a time, by URL.
- **No automatic regeneration** when the dossier changes. Manual re-run only.
- **No integration with a third-party CRM** (Pipedrive, HubSpot). The `lead-sync` webhook in habos already forwards there if configured.
- **No support ticketing** (assignments, SLAs, labels). It's an inbox with AI-drafted replies, not a helpdesk.
- **Only the hero is personalized** on the public `/for/:slug` page. Everything else is the normal Work.tsx landing page.
- **No public sharing of this app itself.** Password-gated admin UI, not a customer-facing product.

If you're asking "should we add X?" — the default answer is no. Revisit scope decisions only when there's a concrete blocker.

## Architecture

### Stack
- Vite + React (same pattern as apps/habos)
- Vercel serverless functions for the backend pipeline
- Supabase (service role) for data + Storage for dossier images
- Claude Sonnet 4.6 via `@anthropic-ai/sdk`
- Resend for outbound
- Cloudflare Email Routing for inbound (webhook → this app)

### Data precedence (strictly enforced in prompts)

**Fact precedence**: approved research → dossier → user emphasis
Claude prompts use explicit XML-ish blocks (`<facts>`, `<tone_guidance>`, `<emphasis>`) with a hard rule: *every claim must be grounded in `<facts>`; emphasis shapes what to foreground, not what exists*. This is the single most important discipline in this app — without it, Claude fabricates "facts" that destroy the sale.

**Pipeline stages**
1. **Gather** — scrape site + synthesize dossier. Sets `dossier_generated_at`.
2. **(Human) Review + Approve** — edit dossier in the UI, click Approve. Sets `dossier_approved_at`.
3. **Classify** — auto-classify into pitch category (or override manually).
4. **Generate hero** — hard-blocks if not approved.
5. **Generate email** — hard-blocks if not approved.
6. **Send email** — Resend.
7. **Publish** — flips `/for/:slug` live.

### Approval gate (A1)
Nothing gets generated from unreviewed research. Enforced server-side in `generate-hero.ts` and `generate-email.ts`.

### Generation history (A4)
Every generation run logs its full brief (inputs) + outputs to `prospect_generation_history`. Rollback + debug.

### Staleness warning (A5)
Dossier older than 60 days shows a yellow UI banner. Not blocking — user decides.

## Local dev

```bash
npm run dev:research
# → http://localhost:3002
```

## Environment variables

Required for the research-agent to fully function:

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
RESEARCH_AGENT_PASSWORD=

# Phase C (outbound email)
RESEND_API_KEY=
EMAIL_FROM=Mathias Haughom <mathias@habos.ai>
EMAIL_REPLY_TO=mathias@habos.ai

# Phase D (inbound support webhook)
CLOUDFLARE_INBOUND_WEBHOOK_SECRET=
```

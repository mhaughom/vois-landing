# Research Agent — Setup Runbook

Step-by-step to get the research-agent fully operational for the first time, including outbound email via Resend and inbound support via Cloudflare Email Routing.

**Total time**: ~30 minutes of active work, plus ~15 minutes of DNS propagation wait.

---

## 1. Apply the database migration

The research-agent V1.1 migration adds: `dossier_approved_at`, email fields, `prospect_generation_history`, `support_threads`, `support_messages`, Storage bucket policies.

```bash
# From the repo root
cd /Users/mathiashaughom/Music/life-intelligence---vois
supabase db push
```

Or paste `supabase/migrations/20260410000000_research_v1_1.sql` into the Supabase SQL editor.

**Verify**:
```sql
select column_name from information_schema.columns
where table_name = 'personalized_pages' and column_name in
  ('dossier_approved_at', 'email_subject', 'recipient_email');
-- Should return 3 rows

select * from prospect_generation_history limit 1;  -- Table exists (empty)
select * from support_threads limit 1;              -- Table exists (empty)
```

---

## 2. Environment variables

Add to the monorepo root `.env` (for local dev) AND to each Vercel project env (for production).

### For the research-agent locally

Append to `/Users/mathiashaughom/Music/life-intelligence---vois/.env`:

```bash
# Already in VOIS backend .env — copy from there
SUPABASE_URL=<same as VOIS>
SUPABASE_SERVICE_ROLE_KEY=<same as VOIS>
ANTHROPIC_API_KEY=<same as VOIS>
RESEND_API_KEY=<same as VOIS — restricted send-only key is fine>

# New — pick any strong password
RESEARCH_AGENT_PASSWORD=<your choice>

# Phase C — outbound email
EMAIL_FROM=Mathias Haughom <mathias@habos.ai>
EMAIL_REPLY_TO=mathias@habos.ai

# Phase D — inbound webhook shared secret (see step 5)
CLOUDFLARE_INBOUND_WEBHOOK_SECRET=<see step 5>
```

### For the Vercel research-agent project

Same variables via `vercel env add` or the dashboard, scoped to Production + Preview + Development.

### For the existing habos Vercel project

The tracking endpoint `/api/personalized/track` needs these:
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

---

## 3. Cloudflare Email Routing (inbound — manual)

The Cloudflare API token in VOIS's backend `.env` has DNS scope but **not** Email Routing scope, so this step must be done in the dashboard.

### 3a. Enable Email Routing

1. Go to `https://dash.cloudflare.com` → habos.ai → **Email** → **Email Routing**
2. Click **Get started** / **Enable Email Routing**
3. Cloudflare auto-creates the MX records for `habos.ai` (route1.mx.cloudflare.net, etc.)
4. Wait ~2 min for propagation

### 3b. Add a destination address

1. Email Routing → **Destination addresses** → **Add destination**
2. Enter your personal Gmail (the forward-to address)
3. Check your Gmail for a Cloudflare verification email → click the link
4. Destination becomes **Verified** in the dashboard

### 3c. Create routing rules

Email Routing → **Routes** → **Create address**:

| Custom address | Action | Destination |
|---|---|---|
| `mathias@habos.ai` | Send to an email | your personal Gmail (verified) |
| `support@habos.ai` | *initially* Send to an email → your personal Gmail | *(will swap to Worker in step 5)* |
| (catch-all) | Send to an email | your personal Gmail |

**Test it**: email `mathias@habos.ai` from a different account → should land in your personal Gmail within ~30 sec.

---

## 4. Resend domain verification (outbound — manual)

The Resend API key you already have is `send-only` scope, so domain verification must be done in the Resend dashboard.

1. Go to `https://resend.com/domains`
2. Click **Add domain** → enter `habos.ai`
3. Resend shows a table of DNS records to add (1 SPF TXT, 2 DKIM TXT records)
4. **Copy those records to me in chat** — I'll add them to Cloudflare via the DNS API token.

   Or add them yourself in Cloudflare dashboard → habos.ai → DNS → Records → Add record.

5. Back in Resend → click **Verify DNS records** → all three should go green within 1-5 min
6. Status becomes **Verified**

**Test it**: in the Resend dashboard → **Logs** → **Send test email** → send a test to your personal Gmail → should arrive with SPF + DKIM passing (check Gmail "Show original" to confirm).

---

## 5. Cloudflare Email Worker deployment (inbound AI reply suggestions)

This step is only needed for Phase D (AI-drafted support replies in the research-agent). If you skip this, inbound email just forwards to your Gmail and you read/reply there manually.

### 5a. Generate a webhook secret

Generate a random shared secret — the Worker and the research-agent both need to know it.

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save this value into:
- `CLOUDFLARE_INBOUND_WEBHOOK_SECRET` in the research-agent env (local + Vercel)
- The Worker's `WEBHOOK_SECRET` secret (set in step 5c below)

### 5b. Create the Worker

```bash
# In a new directory outside this repo
mkdir ~/habos-email-worker && cd ~/habos-email-worker
npm create cloudflare@latest -- --type pages --no-deploy
# or simpler: wrangler init habos-email-worker
```

Copy the contents of `apps/research-agent/infrastructure/cloudflare-email-worker.js` into `src/index.js`.

Install the MIME parser:
```bash
npm install postal-mime
```

Edit `wrangler.toml`:
```toml
name = "habos-email-worker"
main = "src/index.js"
compatibility_date = "2026-04-09"

[vars]
RESEARCH_AGENT_URL = "https://<your-research-agent-domain>/api/inbound/cloudflare"
```

### 5c. Set the webhook secret in the Worker

```bash
wrangler secret put WEBHOOK_SECRET
# Paste the value from step 5a
```

### 5d. Deploy

```bash
wrangler deploy
```

### 5e. Route support@habos.ai to the Worker

1. Cloudflare dashboard → habos.ai → Email → Email Routing → **Routes**
2. Edit the `support@habos.ai` rule
3. Change **Action** from "Send to an email" → **Send to a Worker**
4. Select `habos-email-worker`
5. Save

**Test it**: email `support@habos.ai` from a different account → within ~30 sec a new row should appear in `support_threads` in Supabase, and the thread should show up in the research-agent at `/support`.

---

## 6. DMARC (after DKIM is verified)

Only do this AFTER step 4 is green. DMARC without DKIM causes legitimate mail to fail.

Add a TXT record in Cloudflare DNS:
- Name: `_dmarc`
- Content: `v=DMARC1; p=quarantine; rua=mailto:mathias@habos.ai`

Start with `p=quarantine`. If reports look clean after ~1 week, upgrade to `p=reject`.

---

## 7. Smoke tests

### Research + hero + email generation
```bash
npm run dev:research
# → localhost:3002
```

1. Log in with `RESEARCH_AGENT_PASSWORD`
2. New prospect → enter a company URL (e.g. `https://linear.app`)
3. Wait ~30 sec for gather to complete
4. Review dossier tabs, edit any Claude mistakes
5. Click **Approve dossier**
6. Click **Classify** → see category + reason
7. Click **Generate with Claude** on Hero → fields populate
8. Click **Generate with Claude** on Email → subject + body populate
9. Set recipient to your own test email
10. Click **Send via Resend** → check your inbox
11. Click **Publish** → visit `https://habos.ai/for/linear` (or localhost:3000/for/linear) to see the custom hero

### Support inbox
1. Email `support@habos.ai` from a test account with a real question
2. Within 30 sec: `/support` shows the new thread
3. Click the thread → see the message
4. Click **Draft with Claude** → see AI-drafted reply in the composer
5. Edit, click **Send reply** → check test account for the reply
6. Reply from test account → verify it threads into the same `support_threads` row

---

## 8. Production deploy

Research-agent deploys as its own Vercel project:

```bash
cd /Users/mathiashaughom/Music/life-intelligence---vois/apps/research-agent
vercel link        # link to a new project
vercel env add     # add all env vars from step 2
vercel deploy --prod
```

Then in Vercel dashboard → attach `research.habos.ai` as a custom domain.

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| `Generate hero` returns 409 `research_required` | Dossier not approved | Click **Approve dossier** first |
| `Send via Resend` returns 502 | Domain not verified in Resend | Finish step 4 |
| Cold outbound lands in spam | New domain reputation | Normal for first ~2 weeks. Warm up by replying to prospect replies personally |
| Inbound doesn't create threads | Worker webhook secret mismatch | Verify both sides have the same `CLOUDFLARE_INBOUND_WEBHOOK_SECRET` / `WEBHOOK_SECRET` |
| `Draft with Claude` returns 500 | Missing `ANTHROPIC_API_KEY` | Add to Vercel env |
| Dossier staleness warning keeps showing | Dossier > 60 days old | Click **Gather** to refresh (re-generates + resets approval) |

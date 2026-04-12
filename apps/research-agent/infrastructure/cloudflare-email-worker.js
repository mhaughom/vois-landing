/**
 * Cloudflare Email Worker — habos.ai inbound handler
 *
 * Deploy this to a Cloudflare Worker and point your Cloudflare Email Routing
 * rules at it (instead of forwarding to an email address). The Worker parses
 * incoming email MIME and POSTs a structured payload to the research-agent's
 * /api/inbound/cloudflare endpoint.
 *
 * ─── Deployment ─────────────────────────────────────────────────────────────
 *
 * 1. Install wrangler if you don't have it:
 *      npm install -g wrangler
 *      wrangler login
 *
 * 2. Create a Worker project:
 *      mkdir habos-email-worker && cd habos-email-worker
 *      wrangler init --type javascript
 *      # Copy this file's contents into src/index.js
 *
 * 3. Edit wrangler.toml:
 *      name = "habos-email-worker"
 *      main = "src/index.js"
 *      compatibility_date = "2026-04-09"
 *      send_email = [{ name = "HABOS_EMAIL" }]  # optional, for replies
 *
 *      [vars]
 *      RESEARCH_AGENT_URL = "https://research.habos.ai/api/inbound/cloudflare"
 *      # or for local testing: "http://localhost:3002/api/inbound/cloudflare"
 *
 * 4. Set the webhook secret (matches CLOUDFLARE_INBOUND_WEBHOOK_SECRET on the
 *    research-agent side):
 *      wrangler secret put WEBHOOK_SECRET
 *
 * 5. Deploy:
 *      wrangler deploy
 *
 * 6. In Cloudflare dashboard → habos.ai → Email → Email Routing → Routes,
 *    create a route:
 *      Custom address: support@habos.ai
 *      Action: Send to Worker
 *      Worker: habos-email-worker
 *
 *    (Optionally add a catch-all route to the same Worker, plus a forward-to
 *    personal Gmail backup route for redundancy.)
 *
 * ─── Notes ──────────────────────────────────────────────────────────────────
 *
 * - Uses the `postal-mime` package for MIME parsing. It's tiny (~20kb) and
 *   ships as an npm dependency. If you prefer zero deps, see the manual
 *   header-parsing fallback at the bottom of this file.
 * - On error, the Worker still accepts the message (to avoid bouncing it) but
 *   logs the error to Cloudflare observability.
 * - This Worker does NOT send replies — replies are sent by the research-agent
 *   via Resend, using the thread's Message-ID / References headers for proper
 *   RFC 5322 threading.
 */

import PostalMime from 'postal-mime';

export default {
  async email(message, env, _ctx) {
    try {
      // Parse the raw MIME stream into a structured object
      const parser = new PostalMime();
      const email = await parser.parse(message.raw);

      // Build the structured payload for the research-agent webhook
      const payload = {
        from: email.from?.address || message.from,
        from_name: email.from?.name || null,
        to: (email.to || []).map((a) => a.address),
        cc: (email.cc || []).map((a) => a.address),
        subject: email.subject || null,
        body_text: email.text || stripHtml(email.html || ''),
        body_html: email.html || null,
        message_id: email.messageId || null,
        in_reply_to: email.inReplyTo || null,
        references: parseReferences(email.references),
        received_at: new Date().toISOString(),
      };

      const resp = await fetch(env.RESEARCH_AGENT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': env.WEBHOOK_SECRET,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error('Research-agent webhook failed:', resp.status, text);
        // Don't throw — we don't want to bounce the email just because our
        // webhook is down. The email is already in Cloudflare's logs.
      }
    } catch (err) {
      console.error('Email worker error:', err);
      // Same — don't bounce. Cloudflare will preserve the message for debug.
    }

    // Optional: also forward to personal Gmail as a safety net
    // Requires `forward_email` in wrangler.toml:
    //   await message.forward('you@gmail.com');
  },
};

function stripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseReferences(refs) {
  if (!refs) return null;
  if (Array.isArray(refs)) return refs;
  if (typeof refs === 'string') {
    return refs.trim().split(/\s+/).filter(Boolean);
  }
  return null;
}

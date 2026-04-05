import type { VercelRequest, VercelResponse } from '@vercel/node';

async function forwardToWebhook(record: Record<string, unknown>, retries = 2): Promise<void> {
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (!webhookUrl) throw new Error('LEAD_WEBHOOK_URL not configured');

  const payload = {
    email: record.email,
    source: record.referral_source || 'unknown',
    signed_up_at: record.created_at,
    use_cases: record.use_cases,
    preferred_device: record.preferred_device,
    metadata: record.metadata,
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) return;
      if (attempt < retries) await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error('Webhook delivery failed after retries');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Validate webhook secret from Supabase
  const webhookSecret = req.headers['x-webhook-secret'];
  if (webhookSecret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Invalid webhook secret' });
  }

  const { record } = req.body as { record?: Record<string, unknown> };
  if (!record?.email) {
    return res.status(400).json({ error: 'No email in record' });
  }

  if (!process.env.LEAD_WEBHOOK_URL) {
    // Webhook URL not configured yet — acknowledge but skip
    console.log('Lead received but LEAD_WEBHOOK_URL not configured:', record.email);
    return res.status(200).json({ success: true, skipped: true });
  }

  try {
    await forwardToWebhook(record);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Lead sync failed:', err);
    return res.status(500).json({ error: 'Webhook delivery failed' });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCors } from '../_cors';
import { verifyAuth } from '../_auth';

/**
 * POST /api/auth/verify
 * Checks whether the Bearer token matches RESEARCH_AGENT_PASSWORD.
 * Returns 200 { ok: true } on success, 401 otherwise.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!verifyAuth(req)) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  return res.status(200).json({ ok: true });
}

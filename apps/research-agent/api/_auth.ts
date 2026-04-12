import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';

/**
 * Verify the Authorization: Bearer <password> header against
 * RESEARCH_AGENT_PASSWORD. Uses constant-time comparison.
 */
export function verifyAuth(req: VercelRequest): boolean {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return false;
  const token = header.substring(7);
  const expected = process.env.RESEARCH_AGENT_PASSWORD;
  if (!expected) {
    console.error('[research-agent] RESEARCH_AGENT_PASSWORD not set');
    return false;
  }
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Guard an API route. Returns true if the request is authorized; otherwise
 * writes a 401 response and returns false. Use at the top of every handler:
 *   if (!requireAuth(req, res)) return;
 */
export function requireAuth(req: VercelRequest, res: VercelResponse): boolean {
  if (!verifyAuth(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

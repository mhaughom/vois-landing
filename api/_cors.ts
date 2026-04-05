import type { VercelRequest, VercelResponse } from '@vercel/node';

export const ALLOWED_ORIGINS = [
  'https://habos.ai',
  'https://www.habos.ai',
  'http://localhost:5173',
  'http://localhost:3000',
];

export function getCorsOrigin(req: VercelRequest): string | null {
  const origin = req.headers.origin;
  if (!origin) return null;
  return ALLOWED_ORIGINS.includes(origin) ? origin : null;
}

export function setCorsHeaders(req: VercelRequest, res: VercelResponse): void {
  const allowedOrigin = getCorsOrigin(req);
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

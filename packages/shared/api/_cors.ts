import type { VercelRequest, VercelResponse } from '@vercel/node';

export function createCorsHandler(allowedOrigins: string[]) {
  function getCorsOrigin(req: VercelRequest): string | null {
    const origin = req.headers.origin;
    if (!origin) return null;
    return allowedOrigins.includes(origin) ? origin : null;
  }

  function setCorsHeaders(req: VercelRequest, res: VercelResponse): void {
    const allowedOrigin = getCorsOrigin(req);
    if (allowedOrigin) {
      res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  return { getCorsOrigin, setCorsHeaders };
}

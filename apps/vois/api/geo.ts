import type { VercelRequest, VercelResponse } from '@vercel/node';

// Map ISO country codes to supported i18n language codes
const COUNTRY_TO_LANG: Record<string, string> = {
  // Nordic
  NO: 'no', SE: 'sv', DK: 'da', FI: 'fi',
  // German-speaking
  DE: 'de', AT: 'de', CH: 'de',
  // French-speaking
  FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr',
  // Spanish-speaking
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', EC: 'es', GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es', SV: 'es', NI: 'es', CR: 'es', PA: 'es', UY: 'es',
  // Portuguese-speaking
  PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt',
  // Italian
  IT: 'it',
  // Dutch
  NL: 'nl',
  // Japanese
  JP: 'ja',
  // Korean
  KR: 'ko',
  // Chinese-speaking
  CN: 'zh', TW: 'zh', HK: 'zh', SG: 'zh',
  // Hindi
  IN: 'hi',
  // Arabic-speaking
  SA: 'ar', AE: 'ar', EG: 'ar', IQ: 'ar', MA: 'ar', DZ: 'ar', SD: 'ar', SY: 'ar', YE: 'ar', TN: 'ar', JO: 'ar', LY: 'ar', LB: 'ar', OM: 'ar', KW: 'ar', QA: 'ar', BH: 'ar',
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  const country = (req.headers['x-vercel-ip-country'] as string) || 'US';
  const lang = COUNTRY_TO_LANG[country] || 'en';

  res.setHeader('Cache-Control', 'public, max-age=86400'); // cache 24h
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ country, lang });
}

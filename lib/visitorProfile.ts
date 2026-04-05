/**
 * Persistent visitor profile stored in localStorage.
 * Tracks visitor identity, browsing history, and engagement across sessions.
 */

const STORAGE_KEY = 'habos-visitor-profile';

export type ReferralSource = 'paid' | 'organic' | 'social' | 'direct' | 'referral' | 'unknown';

export interface VisitorProfile {
  visitorId: string;
  firstVisit: string;
  lastVisit: string;
  visitCount: number;
  lastPages: string[];
  chatMessageCount: number;
  capturedEmail: string | null;
  referralSource: ReferralSource;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

function read(): VisitorProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as VisitorProfile;
  } catch { /* ignore */ }
  return null;
}

function write(profile: VisitorProfile): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); }
  catch { /* storage full or unavailable */ }
}

export function getVisitorProfile(): VisitorProfile | null {
  return read();
}

export function initVisitorProfile(): VisitorProfile {
  const existing = read();
  const now = new Date().toISOString();

  if (existing) {
    existing.lastVisit = now;
    existing.visitCount += 1;
    write(existing);
    return existing;
  }

  const profile: VisitorProfile = {
    visitorId: crypto.randomUUID(),
    firstVisit: now,
    lastVisit: now,
    visitCount: 1,
    lastPages: [],
    chatMessageCount: 0,
    capturedEmail: null,
    referralSource: detectReferralSource(),
    ...getUtmParams(),
  };
  write(profile);
  return profile;
}

export function getVisitorId(): string {
  const profile = read();
  if (profile) return profile.visitorId;
  return initVisitorProfile().visitorId;
}

export function isReturningVisitor(): boolean {
  const profile = read();
  return !!profile && profile.visitCount > 1;
}

export function updateVisitorPages(page: string): void {
  const profile = read();
  if (!profile) return;
  // Deduplicate and keep last 5
  const pages = profile.lastPages.filter(p => p !== page);
  pages.push(page);
  profile.lastPages = pages.slice(-5);
  write(profile);
}

export function updateVisitorChatCount(count: number): void {
  const profile = read();
  if (!profile) return;
  profile.chatMessageCount = count;
  write(profile);
}

export function setVisitorEmail(email: string): void {
  const profile = read();
  if (!profile) return;
  profile.capturedEmail = email;
  write(profile);
}

// ── Referral source detection ──

function detectReferralSource(): ReferralSource {
  const params = new URLSearchParams(window.location.search);
  // Google Ads (gclid), Meta Ads (fbclid), or utm_medium=cpc/ppc
  if (params.has('gclid') || params.has('fbclid') || params.has('msclkid')) return 'paid';
  const medium = params.get('utm_medium')?.toLowerCase();
  if (medium === 'cpc' || medium === 'ppc' || medium === 'paid') return 'paid';
  if (medium === 'social') return 'social';

  const referrer = document.referrer;
  if (!referrer) return 'direct';

  const host = new URL(referrer).hostname;
  if (/google|bing|yahoo|duckduckgo|baidu/.test(host)) return 'organic';
  if (/facebook|instagram|twitter|linkedin|tiktok|youtube|reddit/.test(host)) return 'social';

  return 'referral';
}

function getUtmParams(): { utmSource?: string; utmMedium?: string; utmCampaign?: string } {
  const params = new URLSearchParams(window.location.search);
  const result: { utmSource?: string; utmMedium?: string; utmCampaign?: string } = {};
  const source = params.get('utm_source');
  const medium = params.get('utm_medium');
  const campaign = params.get('utm_campaign');
  if (source) result.utmSource = source;
  if (medium) result.utmMedium = medium;
  if (campaign) result.utmCampaign = campaign;
  return result;
}

export function getReferralSource(): ReferralSource {
  return read()?.referralSource || 'unknown';
}

// ── Lead scoring ──

export interface LeadScore {
  score: number;       // 0-100
  tier: 'hot' | 'warm' | 'cold';
  factors: string[];
}

export function calculateLeadScore(): LeadScore {
  const profile = read();
  const factors: string[] = [];
  let score = 0;

  if (!profile) return { score: 0, tier: 'cold', factors: [] };

  // Returning visitor (max 15)
  if (profile.visitCount >= 3) { score += 15; factors.push('3+ visits'); }
  else if (profile.visitCount >= 2) { score += 10; factors.push('returning visitor'); }

  // Email captured (25 — strongest signal)
  if (profile.capturedEmail) { score += 25; factors.push('email captured'); }

  // Chat engagement (max 20)
  if (profile.chatMessageCount >= 10) { score += 20; factors.push('deep chat engagement (10+ msgs)'); }
  else if (profile.chatMessageCount >= 5) { score += 15; factors.push('moderate chat engagement'); }
  else if (profile.chatMessageCount >= 1) { score += 5; factors.push('initiated chat'); }

  // High-intent pages visited (max 20)
  const highIntentPages = ['/work/crm', '/work/dispatch', '/work/finance', '/work/operations'];
  const pricingViewed = profile.lastPages.some(p => p === '/work' || p === '/');
  const highIntentCount = profile.lastPages.filter(p => highIntentPages.includes(p)).length;
  if (highIntentCount >= 2) { score += 20; factors.push('multiple high-intent pages'); }
  else if (highIntentCount >= 1) { score += 10; factors.push('viewed high-intent page'); }
  if (pricingViewed && profile.visitCount > 1) { score += 5; factors.push('pricing revisit'); }

  // Referral source (max 15)
  if (profile.referralSource === 'paid') { score += 15; factors.push('paid traffic'); }
  else if (profile.referralSource === 'organic') { score += 10; factors.push('organic search'); }
  else if (profile.referralSource === 'referral') { score += 10; factors.push('referral traffic'); }
  else if (profile.referralSource === 'social') { score += 5; factors.push('social traffic'); }

  // Pages browsed breadth (max 5)
  if (profile.lastPages.length >= 4) { score += 5; factors.push('browsed 4+ pages'); }

  // Cap at 100
  score = Math.min(score, 100);

  const tier = score >= 60 ? 'hot' : score >= 30 ? 'warm' : 'cold';
  return { score, tier, factors };
}

/**
 * Persistent visitor profile stored in localStorage.
 * Tracks visitor identity, browsing history, and engagement across sessions.
 */

export type ReferralSource = 'paid' | 'organic' | 'social' | 'direct' | 'referral' | 'unknown';

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude: string;
  longitude: string;
}

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
  geo?: GeoLocation;
}

export interface LeadScore {
  score: number;       // 0-100
  tier: 'hot' | 'warm' | 'cold';
  factors: string[];
}

// Factory: creates a visitor profile manager bound to a specific storage key
export function createVisitorProfileManager(storageKey: string, highIntentPages: string[] = []) {
  function read(): VisitorProfile | null {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw) as VisitorProfile;
    } catch { /* ignore */ }
    return null;
  }

  function write(profile: VisitorProfile): void {
    try { localStorage.setItem(storageKey, JSON.stringify(profile)); }
    catch { /* storage full or unavailable */ }
  }

  function detectReferralSource(): ReferralSource {
    const params = new URLSearchParams(window.location.search);
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

  return {
    getVisitorProfile(): VisitorProfile | null {
      return read();
    },

    initVisitorProfile(): VisitorProfile {
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
    },

    getVisitorId(): string {
      const profile = read();
      if (profile) return profile.visitorId;
      return this.initVisitorProfile().visitorId;
    },

    isReturningVisitor(): boolean {
      const profile = read();
      return !!profile && profile.visitCount > 1;
    },

    updateVisitorPages(page: string): void {
      const profile = read();
      if (!profile) return;
      const pages = profile.lastPages.filter(p => p !== page);
      pages.push(page);
      profile.lastPages = pages.slice(-5);
      write(profile);
    },

    updateVisitorChatCount(count: number): void {
      const profile = read();
      if (!profile) return;
      profile.chatMessageCount = count;
      write(profile);
    },

    setVisitorEmail(email: string): void {
      const profile = read();
      if (!profile) return;
      profile.capturedEmail = email;
      write(profile);
    },

    getReferralSource(): ReferralSource {
      return read()?.referralSource || 'unknown';
    },

    calculateLeadScore(): LeadScore {
      const profile = read();
      const factors: string[] = [];
      let score = 0;

      if (!profile) return { score: 0, tier: 'cold', factors: [] };

      if (profile.visitCount >= 3) { score += 15; factors.push('3+ visits'); }
      else if (profile.visitCount >= 2) { score += 10; factors.push('returning visitor'); }

      if (profile.capturedEmail) { score += 25; factors.push('email captured'); }

      if (profile.chatMessageCount >= 10) { score += 20; factors.push('deep chat engagement (10+ msgs)'); }
      else if (profile.chatMessageCount >= 5) { score += 15; factors.push('moderate chat engagement'); }
      else if (profile.chatMessageCount >= 1) { score += 5; factors.push('initiated chat'); }

      const pricingViewed = profile.lastPages.some(p => p === '/work' || p === '/');
      const highIntentCount = profile.lastPages.filter(p => highIntentPages.includes(p)).length;
      if (highIntentCount >= 2) { score += 20; factors.push('multiple high-intent pages'); }
      else if (highIntentCount >= 1) { score += 10; factors.push('viewed high-intent page'); }
      if (pricingViewed && profile.visitCount > 1) { score += 5; factors.push('pricing revisit'); }

      if (profile.referralSource === 'paid') { score += 15; factors.push('paid traffic'); }
      else if (profile.referralSource === 'organic') { score += 10; factors.push('organic search'); }
      else if (profile.referralSource === 'referral') { score += 10; factors.push('referral traffic'); }
      else if (profile.referralSource === 'social') { score += 5; factors.push('social traffic'); }

      if (profile.lastPages.length >= 4) { score += 5; factors.push('browsed 4+ pages'); }

      score = Math.min(score, 100);
      const tier = score >= 60 ? 'hot' : score >= 30 ? 'warm' : 'cold';
      return { score, tier, factors };
    },

    setVisitorGeo(geo: GeoLocation): void {
      const profile = read();
      if (!profile) return;
      profile.geo = geo;
      write(profile);
    },
  };
}

// ── Configurable default instance ──
// Apps call configureVisitorProfile() at startup; shared components use the named exports below.

let _manager = createVisitorProfileManager('visitor-profile');

export function configureVisitorProfile(storageKey: string, highIntentPages: string[] = []) {
  _manager = createVisitorProfileManager(storageKey, highIntentPages);
}

export const getVisitorProfile = () => _manager.getVisitorProfile();
export const initVisitorProfile = () => _manager.initVisitorProfile();
export const getVisitorId = () => _manager.getVisitorId();
export const isReturningVisitor = () => _manager.isReturningVisitor();
export const updateVisitorPages = (page: string) => _manager.updateVisitorPages(page);
export const updateVisitorChatCount = (count: number) => _manager.updateVisitorChatCount(count);
export const setVisitorEmail = (email: string) => _manager.setVisitorEmail(email);
export const getReferralSource = () => _manager.getReferralSource();
export const calculateLeadScore = () => _manager.calculateLeadScore();
export const setVisitorGeo = (geo: GeoLocation) => _manager.setVisitorGeo(geo);

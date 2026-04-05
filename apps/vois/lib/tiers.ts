// ─── Tier definitions ────────────────────────────────────────────────────────
// Source of truth for pricing, quotas, and feature gates across the app.

export type TierId = 'free' | 'personal' | 'work';
export type PlanId = 'personal_monthly' | 'personal_annual' | 'work_monthly' | 'work_annual';

// ─── Pricing ─────────────────────────────────────────────────────────────────

export const PLANS: Record<PlanId, { name: string; price: string; interval: string; tier: TierId }> = {
  personal_monthly: { name: 'Personal Monthly', price: '$14.99', interval: '/month', tier: 'personal' },
  personal_annual:  { name: 'Personal Annual',  price: '$79.99', interval: '/year',  tier: 'personal' },
  work_monthly:     { name: 'Work Monthly',     price: '$34.99', interval: '/month', tier: 'work' },
  work_annual:      { name: 'Work Annual',      price: '$249.99', interval: '/year', tier: 'work' },
};

// ─── Free tier – mobile lifetime limits ──────────────────────────────────────

export const FREE_MOBILE_LIMITS = {
  recordings: 5,           // total recordings ever
  chatMessages: 5,         // total chat messages ever
  customApps: 1,           // total custom apps (spaces)
  maxRecordingDuration: 3, // minutes per recording
} as const;

// ─── Backend quotas — monthly ────────────────────────────────────────────────

export interface MonthlyQuota {
  tokens: number;
  apiCalls: number;
  cost: number;        // USD budget
  audioMinutes: number;
}

export const MONTHLY_QUOTAS: Record<TierId, MonthlyQuota> = {
  free:     { tokens: 100_000,   apiCalls: 500,    cost: 5,   audioMinutes: 30 },
  personal: { tokens: 1_000_000, apiCalls: 5_000,  cost: 50,  audioMinutes: 300 },
  work:     { tokens: 5_000_000, apiCalls: 25_000, cost: 250, audioMinutes: 1_500 },
};

// ─── Backend quotas — per session ────────────────────────────────────────────

export interface SessionQuota {
  tokens: number;
  apiCalls: number;
  audioMinutes: number;
}

export const SESSION_QUOTAS: Record<TierId, SessionQuota> = {
  free:     { tokens: 10_000,  apiCalls: 20,  audioMinutes: 5 },
  personal: { tokens: 50_000,  apiCalls: 100, audioMinutes: 30 },
  work:     { tokens: 100_000, apiCalls: 200, audioMinutes: 60 },
};

// ─── Backend quotas — per-function call limits ───────────────────────────────

export interface FunctionCallLimits {
  profile_generation: number;
  meeting_brief: number;
  journal_generate: number;
  daily_briefing: number;
}

export const FUNCTION_CALL_LIMITS: Record<TierId, FunctionCallLimits> = {
  free:     { profile_generation: 5,  meeting_brief: 10, journal_generate: 3,  daily_briefing: 30 },
  personal: { profile_generation: 30, meeting_brief: 50, journal_generate: 20, daily_briefing: 60 },
  work:     { profile_generation: 100, meeting_brief: 200, journal_generate: 100, daily_briefing: 200 },
};

// ─── Feature lists for pricing cards ─────────────────────────────────────────

export const FREE_FEATURES = [
  '5 voice recordings',
  '5 chat messages',
  '1 custom app',
  'Up to 3 min per recording',
  'iPhone & Apple Watch',
];

export const PERSONAL_FEATURES = [
  'Unlimited voice capture',
  'Unlimited chat',
  'Unlimited custom apps',
  'Up to 30 min per session',
  'iPhone & Apple Watch',
  'Cloud sync across devices',
];

export const WORK_FEATURES = [
  'Everything in Personal',
  'Meeting transcription',
  'Action items & summaries',
  'Up to 60 min per session',
  'Team collaboration tools',
  'Priority support',
];

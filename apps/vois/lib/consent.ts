import { createConsentManager } from '@li/shared/lib/consent';

const consent = createConsentManager('vois_cookie_consent');

export const {
  getConsent,
  setConsent,
  hasAnalyticsConsent,
  isPostHogReady,
  initPostHog,
  applyConsent,
  bootConsent,
  onConsentChange,
} = consent;

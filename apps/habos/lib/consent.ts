import { createConsentManager } from '@li/shared/lib/consent';

const consent = createConsentManager('habos_cookie_consent');

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

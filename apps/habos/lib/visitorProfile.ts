import { createVisitorProfileManager } from '@li/shared/lib/visitorProfile';

const HABOS_HIGH_INTENT_PAGES = ['/work/crm', '/work/dispatch', '/work/finance', '/work/operations'];

const manager = createVisitorProfileManager('habos-visitor-profile', HABOS_HIGH_INTENT_PAGES);

export const {
  getVisitorProfile,
  initVisitorProfile,
  getVisitorId,
  isReturningVisitor,
  updateVisitorPages,
  updateVisitorChatCount,
  setVisitorEmail,
  getReferralSource,
  calculateLeadScore,
} = manager;

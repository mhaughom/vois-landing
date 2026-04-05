import { createVisitorProfileManager } from '@li/shared/lib/visitorProfile';

const manager = createVisitorProfileManager('vois-visitor-profile');

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

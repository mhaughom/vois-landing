import posthog from 'posthog-js';
import { isPostHogReady } from './consent';

/**
 * Safe wrapper around posthog.capture — silently no-ops when PostHog
 * hasn't been initialised (i.e. user hasn't consented to analytics yet).
 */
function capture(event: string, properties?: Record<string, unknown>) {
  if (!isPostHogReady()) return;
  posthog.capture(event, properties);
}

export const Analytics = {
  // Page views
  pageView: (pageName: string) => {
    capture('$pageview', { page: pageName });
  },

  // Demo funnel
  demoStarted: (device: 'phone' | 'watch') => {
    capture('demo_started', { device });
  },

  demoRecordingStarted: (device: 'phone' | 'watch') => {
    capture('demo_recording_started', { device });
  },

  demoRecordingCompleted: (duration: number) => {
    capture('demo_recording_completed', { duration_seconds: duration });
  },

  demoProcessingStarted: () => {
    capture('demo_processing_started');
  },

  demoResultsViewed: (itemCount: number, categories: string[]) => {
    capture('demo_results_viewed', {
      item_count: itemCount,
      categories,
    });
  },

  // Chat funnel
  chatOpened: () => {
    capture('chat_opened');
  },

  chatMessageSent: (isFirstMessage: boolean) => {
    capture('chat_message_sent', { is_first_message: isFirstMessage });
  },

  chatLimitReached: () => {
    capture('chat_limit_reached');
  },

  // Checkout funnel
  checkoutModalOpened: (source: 'hero' | 'pricing' | 'nav') => {
    capture('checkout_modal_opened', { source });
  },

  checkoutStep1Completed: (categories: string[]) => {
    capture('checkout_step1_completed', {
      categories,
      category_count: categories.length,
    });
  },

  checkoutStep2Completed: (devices: string[]) => {
    capture('checkout_step2_completed', {
      devices,
      uses_watch: devices.includes('watch') || devices.includes('both'),
      uses_phone: devices.includes('phone') || devices.includes('both'),
    });
  },

  checkoutEmailEntered: () => {
    capture('checkout_email_entered');
  },

  checkoutRedirectToStripe: () => {
    capture('checkout_redirect_to_stripe');
  },

  checkoutCompleted: (plan?: string) => {
    capture('checkout_completed', { plan });
  },

  checkoutAbandoned: (step: number) => {
    capture('checkout_abandoned', { abandoned_at_step: step });
  },

  // Navigation / Engagement
  videoWatched: () => {
    capture('video_watched');
  },

  tabClicked: (tab: 'when' | 'how' | 'why') => {
    capture('tab_clicked', { tab });
  },

  faqExpanded: (question: string, questionIndex: number) => {
    capture('faq_expanded', { question, question_index: questionIndex });
  },

  scrolledToPricing: () => {
    capture('scrolled_to_pricing');
  },

  externalLinkClicked: (destination: string) => {
    capture('external_link_clicked', { destination });
  },

  // Errors
  errorOccurred: (error: string, context: string) => {
    capture('error_occurred', { error, context });
  },

  // Scroll depth
  sectionViewed: (section: string) => {
    capture('section_viewed', { section });
  },

  // Demo drop-offs
  demoCancelled: (stage: string) => {
    capture('demo_cancelled', { cancelled_at_stage: stage });
  },

  demoMicrophoneDenied: () => {
    capture('demo_microphone_denied');
  },

  demoError: (errorType: string, message: string) => {
    capture('demo_error', { error_type: errorType, message });
  },

  demoRetryStarted: () => {
    capture('demo_retry_started');
  },

  // Video engagement
  videoPlayed: (videoId: string) => {
    capture('video_played', { video_id: videoId });
  },

  videoPaused: (videoId: string, percentWatched: number) => {
    capture('video_paused', { video_id: videoId, percent_watched: percentWatched });
  },

  videoProgress: (videoId: string, percent: number) => {
    capture('video_progress', { video_id: videoId, percent });
  },

  videoCompleted: (videoId: string) => {
    capture('video_completed', { video_id: videoId });
  },

  // Time to action
  timeToAction: (action: string, seconds: number) => {
    capture('time_to_action', { action, seconds });
  },

  // Chat
  chatSuggestedQuestionClicked: (question: string) => {
    capture('chat_suggested_question_clicked', { question });
  },

  // Plan selection
  planSelected: (plan: string) => {
    capture('plan_selected', { plan });
  },

  // Login
  loginAttempted: () => {
    capture('login_attempted');
  },

  loginFailed: (error: string) => {
    capture('login_failed', { error });
  },

  loginSucceeded: () => {
    capture('login_succeeded');
  },

  forgotPasswordClicked: () => {
    capture('forgot_password_clicked');
  },

  // Session properties
  setSessionProperties: (properties: Record<string, unknown>) => {
    if (!isPostHogReady()) return;
    posthog.register(properties);
  },

  // Performance
  performanceMetric: (metric: string, valueMs: number) => {
    capture('performance_metric', { metric, value_ms: valueMs });
  },

  // Work page
  workPageViewed: () => {
    capture('work_page_viewed');
  },

  workVideoClicked: (videoTitle: string) => {
    capture('work_video_clicked', { video_title: videoTitle });
  },

  workBetaSubmitted: () => {
    capture('work_beta_submitted');
  },

  // Checkout timing
  checkoutStepViewed: (step: number) => {
    capture('checkout_step_viewed', { step });
  },

  // User identification (after purchase)
  identifyUser: (email: string, properties?: Record<string, unknown>) => {
    if (!isPostHogReady()) return;
    posthog.identify(email, properties);
  },

  // Waitlist funnel
  waitlistModalOpened: (source: string) => {
    capture('waitlist_modal_opened', { source });
  },

  waitlistEmailEntered: (source: string) => {
    capture('waitlist_email_entered', { source });
  },

  waitlistSignup: (email: string, data?: Record<string, unknown>) => {
    if (!isPostHogReady()) return;
    // Identify the user in PostHog
    posthog.identify(email, {
      email,
      joined_waitlist: true,
      waitlist_signup_date: new Date().toISOString(),
      ...data,
    });
    capture('waitlist_signup', data);
  },

  waitlistSkippedQuestions: () => {
    capture('waitlist_skipped_questions');
  },
};

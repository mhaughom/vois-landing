import posthog from 'posthog-js';

export const Analytics = {
  // Page views
  pageView: (pageName: string) => {
    posthog.capture('$pageview', { page: pageName });
  },

  // Demo funnel
  demoStarted: (device: 'phone' | 'watch') => {
    posthog.capture('demo_started', { device });
  },

  demoRecordingStarted: (device: 'phone' | 'watch') => {
    posthog.capture('demo_recording_started', { device });
  },

  demoRecordingCompleted: (duration: number) => {
    posthog.capture('demo_recording_completed', { duration_seconds: duration });
  },

  demoProcessingStarted: () => {
    posthog.capture('demo_processing_started');
  },

  demoResultsViewed: (itemCount: number, categories: string[]) => {
    posthog.capture('demo_results_viewed', {
      item_count: itemCount,
      categories,
    });
  },

  // Chat funnel
  chatOpened: () => {
    posthog.capture('chat_opened');
  },

  chatMessageSent: (isFirstMessage: boolean) => {
    posthog.capture('chat_message_sent', { is_first_message: isFirstMessage });
  },

  chatLimitReached: () => {
    posthog.capture('chat_limit_reached');
  },

  // Checkout funnel
  checkoutModalOpened: (source: 'hero' | 'pricing' | 'nav') => {
    posthog.capture('checkout_modal_opened', { source });
  },

  checkoutStep1Completed: (categories: string[]) => {
    posthog.capture('checkout_step1_completed', {
      categories,
      category_count: categories.length,
    });
  },

  checkoutStep2Completed: (devices: string[]) => {
    posthog.capture('checkout_step2_completed', {
      devices,
      uses_watch: devices.includes('watch') || devices.includes('both'),
      uses_phone: devices.includes('phone') || devices.includes('both'),
    });
  },

  checkoutEmailEntered: () => {
    posthog.capture('checkout_email_entered');
  },

  checkoutRedirectToStripe: () => {
    posthog.capture('checkout_redirect_to_stripe');
  },

  checkoutCompleted: (founderNumber?: number) => {
    posthog.capture('checkout_completed', { founder_number: founderNumber });
  },

  checkoutAbandoned: (step: number) => {
    posthog.capture('checkout_abandoned', { abandoned_at_step: step });
  },

  // Navigation / Engagement
  videoWatched: () => {
    posthog.capture('video_watched');
  },

  tabClicked: (tab: 'when' | 'how' | 'why') => {
    posthog.capture('tab_clicked', { tab });
  },

  faqExpanded: (question: string, questionIndex: number) => {
    posthog.capture('faq_expanded', { question, question_index: questionIndex });
  },

  scrolledToPricing: () => {
    posthog.capture('scrolled_to_pricing');
  },

  externalLinkClicked: (destination: string) => {
    posthog.capture('external_link_clicked', { destination });
  },

  // Errors
  errorOccurred: (error: string, context: string) => {
    posthog.capture('error_occurred', { error, context });
  },

  // Scroll depth
  sectionViewed: (section: string) => {
    posthog.capture('section_viewed', { section });
  },

  // Demo drop-offs
  demoCancelled: (stage: string) => {
    posthog.capture('demo_cancelled', { cancelled_at_stage: stage });
  },

  demoMicrophoneDenied: () => {
    posthog.capture('demo_microphone_denied');
  },

  demoError: (errorType: string, message: string) => {
    posthog.capture('demo_error', { error_type: errorType, message });
  },

  demoRetryStarted: () => {
    posthog.capture('demo_retry_started');
  },

  // Video engagement
  videoPlayed: (videoId: string) => {
    posthog.capture('video_played', { video_id: videoId });
  },

  videoPaused: (videoId: string, percentWatched: number) => {
    posthog.capture('video_paused', { video_id: videoId, percent_watched: percentWatched });
  },

  videoProgress: (videoId: string, percent: number) => {
    posthog.capture('video_progress', { video_id: videoId, percent });
  },

  videoCompleted: (videoId: string) => {
    posthog.capture('video_completed', { video_id: videoId });
  },

  // Time to action
  timeToAction: (action: string, seconds: number) => {
    posthog.capture('time_to_action', { action, seconds });
  },

  // Chat
  chatSuggestedQuestionClicked: (question: string) => {
    posthog.capture('chat_suggested_question_clicked', { question });
  },

  // Founder spots
  founderSpotsViewed: (remaining: number) => {
    posthog.capture('founder_spots_viewed', { remaining });
  },

  // Login
  loginAttempted: () => {
    posthog.capture('login_attempted');
  },

  loginFailed: (error: string) => {
    posthog.capture('login_failed', { error });
  },

  loginSucceeded: () => {
    posthog.capture('login_succeeded');
  },

  forgotPasswordClicked: () => {
    posthog.capture('forgot_password_clicked');
  },

  // Session properties
  setSessionProperties: (properties: Record<string, unknown>) => {
    posthog.register(properties);
  },

  // Performance
  performanceMetric: (metric: string, valueMs: number) => {
    posthog.capture('performance_metric', { metric, value_ms: valueMs });
  },

  // Work page
  workPageViewed: () => {
    posthog.capture('work_page_viewed');
  },

  workVideoClicked: (videoTitle: string) => {
    posthog.capture('work_video_clicked', { video_title: videoTitle });
  },

  workBetaSubmitted: () => {
    posthog.capture('work_beta_submitted');
  },

  // Checkout timing
  checkoutStepViewed: (step: number) => {
    posthog.capture('checkout_step_viewed', { step });
  },

  // User identification (after purchase)
  identifyUser: (email: string, properties?: Record<string, unknown>) => {
    posthog.identify(email, properties);
  },
};

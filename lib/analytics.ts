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

  faqExpanded: (question: string) => {
    posthog.capture('faq_expanded', { question });
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

  // User identification (after purchase)
  identifyUser: (email: string, properties?: Record<string, unknown>) => {
    posthog.identify(email, properties);
  },
};

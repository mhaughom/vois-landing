import { initAnalytics, Analytics } from '@li/shared/lib/analytics';
import { isPostHogReady } from './consent';

// Wire analytics to this app's consent manager
initAnalytics(isPostHogReady);

export { Analytics };

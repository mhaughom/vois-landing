/**
 * Auto-tracker: captures scroll depth and session duration passively.
 * Import once in each app's entry point to activate.
 */
import { updateScrollDepth, updateSessionDuration } from './visitorProfile';

let _initialized = false;

export function initAutoTracker() {
  if (_initialized || typeof window === 'undefined') return;
  _initialized = true;

  // ── Scroll depth tracking ──
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const depth = Math.min(1, scrollTop / docHeight);
        updateScrollDepth(window.location.pathname, depth);
      }
      ticking = false;
    });
  }, { passive: true });

  // ── Session duration tracking ──
  // Update every 30s while page is visible
  const durationInterval = setInterval(() => {
    if (!document.hidden) {
      updateSessionDuration();
    }
  }, 30000);

  // Also update on page hide (tab close, navigate away)
  window.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      updateSessionDuration();
    }
  });

  window.addEventListener('beforeunload', () => {
    updateSessionDuration();
    clearInterval(durationInterval);
  });
}

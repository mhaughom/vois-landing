import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Cookie, ChevronDown } from 'lucide-react';
import { getConsent, setConsent, onConsentChange } from '../lib/consent';

/**
 * Cookie consent banner.
 *
 * Shown at the bottom of the viewport when the user hasn't made a consent
 * choice yet. Provides "Accept", "Reject" and an expandable "Manage" panel
 * with a toggle for analytics tracking.
 *
 * Also exported: <CookieSettingsTrigger /> — a small button that re-opens
 * the preferences panel (placed in the footer).
 */

// ── Main Banner ──────────────────────────────────────────────────────────────

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    // Show banner only if consent hasn't been given yet
    const consent = getConsent();
    if (!consent) {
      // Small delay so the banner doesn't flash on the very first paint
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    setConsent(true);
    setVisible(false);
  };

  const handleRejectAll = () => {
    setConsent(false);
    setVisible(false);
  };

  const handleSavePreferences = () => {
    setConsent(analyticsEnabled);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[9998] p-4 sm:p-6"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl shadow-black/10 border border-slate-200 overflow-hidden">
            {/* Main banner */}
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex w-10 h-10 rounded-full bg-slate-100 items-center justify-center flex-shrink-0 mt-0.5">
                  <Cookie size={18} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-slate-900 mb-1">
                    We value your privacy
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    We use analytics to understand how visitors interact with our site so we can improve the experience.
                    No data is used for advertising.{' '}
                    <Link to="/Privacy" className="underline hover:text-slate-700 transition-colors">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
                <button
                  onClick={handleRejectAll}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100"
                  aria-label="Reject all cookies"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 mt-5 flex-wrap">
                <button
                  onClick={handleAcceptAll}
                  className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 active:scale-[0.98] transition-all"
                >
                  Accept All
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-full hover:bg-slate-200 active:scale-[0.98] transition-all"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="px-4 py-2.5 text-slate-500 text-sm font-medium hover:text-slate-700 transition-colors flex items-center gap-1.5"
                >
                  Manage
                  <motion.span
                    animate={{ rotate: showDetails ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex"
                  >
                    <ChevronDown size={14} />
                  </motion.span>
                </button>
              </div>
            </div>

            {/* Expanded preferences */}
            <AnimatePresence initial={false}>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-2 border-t border-slate-100">
                    <div className="space-y-4">
                      {/* Necessary — always on */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">Necessary</p>
                          <p className="text-xs text-slate-400 mt-0.5">Required for the site to function. Cannot be disabled.</p>
                        </div>
                        <div className="relative w-11 h-6 bg-slate-900 rounded-full cursor-not-allowed opacity-60">
                          <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm" />
                        </div>
                      </div>

                      {/* Analytics — toggleable */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">Analytics</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Helps us understand usage patterns via PostHog (EU-hosted). No ad tracking.
                          </p>
                        </div>
                        <button
                          onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${analyticsEnabled ? 'bg-slate-900' : 'bg-slate-300'}`}
                          role="switch"
                          aria-checked={analyticsEnabled}
                          aria-label="Toggle analytics tracking"
                        >
                          <motion.div
                            className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
                            animate={{ left: analyticsEnabled ? 20 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Save preferences */}
                    <button
                      onClick={handleSavePreferences}
                      className="mt-5 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 active:scale-[0.98] transition-all"
                    >
                      Save Preferences
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── Footer trigger ───────────────────────────────────────────────────────────

/**
 * Small link/button for the footer that re-opens cookie preferences.
 * Opens an inline modal-style panel.
 */
export const CookieSettingsTrigger: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  // Sync toggle state with stored consent when opening
  useEffect(() => {
    if (open) {
      const consent = getConsent();
      setAnalyticsEnabled(consent?.analytics ?? false);
    }
  }, [open]);

  // Close if consent changes externally
  useEffect(() => {
    return onConsentChange(() => setOpen(false));
  }, []);

  const handleSave = () => {
    setConsent(analyticsEnabled);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-slate-500 text-sm hover:text-slate-900 transition-colors text-left"
      >
        Cookie Settings
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

            {/* Panel */}
            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900">Cookie Preferences</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                Control which cookies and tracking technologies are active.{' '}
                <Link to="/Privacy" className="underline hover:text-slate-700" onClick={() => setOpen(false)}>
                  Privacy Policy
                </Link>
              </p>

              <div className="space-y-4 mb-6">
                {/* Necessary */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Necessary</p>
                    <p className="text-xs text-slate-400 mt-0.5">Required for the site to function.</p>
                  </div>
                  <div className="relative w-11 h-6 bg-slate-900 rounded-full cursor-not-allowed opacity-60">
                    <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm" />
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Analytics</p>
                    <p className="text-xs text-slate-400 mt-0.5">PostHog analytics (EU-hosted). No ad tracking.</p>
                  </div>
                  <button
                    onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${analyticsEnabled ? 'bg-slate-900' : 'bg-slate-300'}`}
                    role="switch"
                    aria-checked={analyticsEnabled}
                    aria-label="Toggle analytics"
                  >
                    <motion.div
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
                      animate={{ left: analyticsEnabled ? 20 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 active:scale-[0.98] transition-all"
                >
                  Save Preferences
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-full hover:bg-slate-200 active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CookieConsent;

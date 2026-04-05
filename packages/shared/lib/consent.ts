/**
 * Cookie/tracking consent management.
 *
 * Stores the visitor's consent choice in localStorage (which is itself
 * "strictly necessary" storage and does not require consent).
 *
 * PostHog is only initialised after the user explicitly opts in to analytics.
 */

import posthog from 'posthog-js';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ConsentState {
  /** Whether analytics (PostHog) tracking is allowed */
  analytics: boolean;
  /** ISO timestamp of when consent was given/updated */
  timestamp: string;
  /** Consent schema version – bump when categories change */
  version: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const CONSENT_VERSION = 1;

// ── Factory ─────────────────────────────────────────────────────────────────

export function createConsentManager(storageKey: string) {
  // ── Listeners ──
  type ConsentListener = (state: ConsentState) => void;
  const listeners = new Set<ConsentListener>();

  function onConsentChange(listener: ConsentListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function notifyListeners(state: ConsentState) {
    listeners.forEach((fn) => fn(state));
  }

  // ── Read / Write ──

  function getConsent(): ConsentState | null {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed: ConsentState = JSON.parse(raw);
      if (parsed.version !== CONSENT_VERSION) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function setConsent(analytics: boolean): ConsentState {
    const state: ConsentState = {
      analytics,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    localStorage.setItem(storageKey, JSON.stringify(state));
    applyConsent(state);
    notifyListeners(state);
    return state;
  }

  function hasAnalyticsConsent(): boolean {
    return getConsent()?.analytics === true;
  }

  // ── PostHog lifecycle ──

  let posthogInitialised = false;

  function isPostHogReady(): boolean {
    return posthogInitialised;
  }

  function initPostHog() {
    if (posthogInitialised) return;
    const key = import.meta.env.VITE_POSTHOG_KEY;
    if (!key) return;

    posthog.init(key, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com',
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      persistence: 'localStorage',
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '[data-mask]',
      },
    });
    posthogInitialised = true;
  }

  function shutdownPostHog() {
    if (!posthogInitialised) return;
    try {
      posthog.opt_out_capturing();
      posthog.reset();
    } catch {
      // Defensive – PostHog may not be fully initialised
    }
    posthogInitialised = false;
  }

  // ── Apply ──

  function applyConsent(state: ConsentState) {
    if (state.analytics) {
      initPostHog();
    } else {
      shutdownPostHog();
    }
  }

  function bootConsent() {
    const stored = getConsent();
    if (stored) {
      applyConsent(stored);
    }
  }

  return {
    getConsent,
    setConsent,
    hasAnalyticsConsent,
    isPostHogReady,
    initPostHog,
    applyConsent,
    bootConsent,
    onConsentChange,
  };
}

// ── Configurable default instance ──
// Apps call configureConsent() at startup; shared components use the named exports below.

let _consent = createConsentManager('cookie_consent');

export function configureConsent(storageKey: string) {
  _consent = createConsentManager(storageKey);
}

export const getConsent = () => _consent.getConsent();
export const setConsent = (analytics: boolean) => _consent.setConsent(analytics);
export const hasAnalyticsConsent = () => _consent.hasAnalyticsConsent();
export const isPostHogReady = () => _consent.isPostHogReady();
export const initPostHog = () => _consent.initPostHog();
export const applyConsent = (state: ConsentState) => _consent.applyConsent(state);
export const bootConsent = () => _consent.bootConsent();
export const onConsentChange = (listener: (state: ConsentState) => void) => _consent.onConsentChange(listener);

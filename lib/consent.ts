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

const STORAGE_KEY = 'vois_cookie_consent';
const CONSENT_VERSION = 1;

// ── Listeners ────────────────────────────────────────────────────────────────

type ConsentListener = (state: ConsentState) => void;
const listeners = new Set<ConsentListener>();

export function onConsentChange(listener: ConsentListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners(state: ConsentState) {
  listeners.forEach((fn) => fn(state));
}

// ── Read / Write ─────────────────────────────────────────────────────────────

/** Return the stored consent, or `null` if the user hasn't decided yet. */
export function getConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: ConsentState = JSON.parse(raw);
    // If the consent schema version changed, treat as "not yet consented"
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Persist the user's consent choice and apply it immediately. */
export function setConsent(analytics: boolean): ConsentState {
  const state: ConsentState = {
    analytics,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  applyConsent(state);
  notifyListeners(state);
  return state;
}

/** Whether the user has opted in to analytics tracking. */
export function hasAnalyticsConsent(): boolean {
  return getConsent()?.analytics === true;
}

// ── PostHog lifecycle ────────────────────────────────────────────────────────

let posthogInitialised = false;

/** Returns true if PostHog has been initialised in this session. */
export function isPostHogReady(): boolean {
  return posthogInitialised;
}

/** Initialise PostHog (idempotent – safe to call multiple times). */
export function initPostHog() {
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

/** Shut PostHog down (e.g. when user revokes consent). */
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

// ── Apply ────────────────────────────────────────────────────────────────────

/** Apply a consent state – start or stop PostHog as needed. */
export function applyConsent(state: ConsentState) {
  if (state.analytics) {
    initPostHog();
  } else {
    shutdownPostHog();
  }
}

/** Boot: read stored consent and apply it (call once at startup). */
export function bootConsent() {
  const stored = getConsent();
  if (stored) {
    applyConsent(stored);
  }
  // If null → user hasn't decided yet → PostHog stays off → banner will show
}

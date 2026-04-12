/**
 * Simple password-as-token auth for the internal research agent.
 * The password is stored in sessionStorage and sent as a Bearer token on
 * every API request. Server-side verification in api/_auth.ts compares it
 * against RESEARCH_AGENT_PASSWORD env var with timingSafeEqual.
 */

const KEY = 'ra_auth_token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(KEY);
}

export function setAuthToken(token: string): void {
  sessionStorage.setItem(KEY, token);
}

export function clearAuthToken(): void {
  sessionStorage.removeItem(KEY);
}

export function isLoggedIn(): boolean {
  return !!getAuthToken();
}

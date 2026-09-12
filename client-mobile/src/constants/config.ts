// Program rules from docs/client-mobile-architecture.md
export const COINS_PER_ZLOTY = 4;
export const RESIDENT_CARD_MULTIPLIER = 1.15;

export const STORAGE_KEYS = {
  sessionUserId: 'wolomin.sessionUserId',
  hasResidentCard: 'wolomin.hasResidentCard',
  apiBaseUrl: 'wolomin.apiBaseUrl',
} as const;

export const REQUEST_TIMEOUT_MS = 8000;

/**
 * There is no login/auth yet (real auth is coming via Cognito). Until then the
 * app bootstraps a fixed demo user from the backend's seed data (id 1 = "Jan
 * Kowalski"). Replace with a real Cognito session in session-context.tsx once
 * auth lands.
 */
export const DEFAULT_DEMO_USER_ID = 1;

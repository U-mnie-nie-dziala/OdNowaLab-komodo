// Program rules from docs/client-mobile-architecture.md
export const COINS_PER_ZLOTY = 4;
export const RESIDENT_CARD_MULTIPLIER = 1.15;

export const STORAGE_KEYS = {
  hasResidentCard: 'wolomin.hasResidentCard',
  apiBaseUrl: 'wolomin.apiBaseUrl',
  authAccessToken: 'wolomin.auth.accessToken',
  authIdToken: 'wolomin.auth.idToken',
  authRefreshToken: 'wolomin.auth.refreshToken',
  authExpiresAt: 'wolomin.auth.expiresAt',
} as const;

export const REQUEST_TIMEOUT_MS = 8000;

// Program rules from docs/client-mobile-architecture.md
export const COINS_PER_ZLOTY = 4;
export const RESIDENT_CARD_MULTIPLIER = 1.15;

export const STORAGE_KEYS = {
  sessionUserId: 'wolomin.sessionUserId',
  hasResidentCard: 'wolomin.hasResidentCard',
} as const;

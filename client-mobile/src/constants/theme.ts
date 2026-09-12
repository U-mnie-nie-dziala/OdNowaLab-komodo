/**
 * Design tokens ported from business-frontend/app/globals.css so the mobile
 * app matches the web app's brand (green) + coin (gold) visual identity.
 */

export const Brand = {
  50: '#eefaf3',
  100: '#d6f2e1',
  200: '#aee5c6',
  300: '#78d1a4',
  400: '#43b67f',
  500: '#1f9a63',
  600: '#137a4f',
  700: '#106141',
  800: '#0f4d36',
  900: '#0c3f2d',
} as const;

export const Coin = {
  100: '#fdf0d5',
  200: '#fbe1ad',
  300: '#ffdd8a',
  400: '#f9c452',
  500: '#f0a91e',
  600: '#d98a0b',
  700: '#b46c08',
} as const;

export const Destructive = {
  50: '#fef2f2',
  100: '#fee2e2',
  300: '#fca5a5',
  500: '#ef4444',
  700: '#b91c1c',
} as const;

export const Neutral = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  400: '#94a3b8',
  500: '#64748b',
} as const;

export const Colors = {
  text: '#0f2a20',
  textSecondary: '#4b6157',
  background: '#f6f8f6',
  backgroundElement: '#ffffff',
  border: 'rgba(0, 0, 0, 0.05)',
} as const;

export type ThemeColor = keyof typeof Colors;

export const Radius = {
  md: 8,
  xl: 12,
  xxl: 16,
  xxxl: 24,
  full: 9999,
} as const;

export const Fonts = {
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semiBold: 'Geist_600SemiBold',
  bold: 'Geist_700Bold',
  extraBold: 'Geist_800ExtraBold',
  mono: 'GeistMono_500Medium',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 800;

import * as SecureStore from 'expo-secure-store';

import { STORAGE_KEYS } from '@/constants/config';

export type StoredTokens = {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
};

export async function saveTokens(auth: {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}): Promise<void> {
  const expiresAt = Date.now() + auth.expiresIn * 1000;
  await Promise.all([
    SecureStore.setItemAsync(STORAGE_KEYS.authAccessToken, auth.accessToken),
    SecureStore.setItemAsync(STORAGE_KEYS.authIdToken, auth.idToken),
    SecureStore.setItemAsync(STORAGE_KEYS.authRefreshToken, auth.refreshToken),
    SecureStore.setItemAsync(STORAGE_KEYS.authExpiresAt, String(expiresAt)),
  ]);
}

export async function getTokens(): Promise<StoredTokens | null> {
  const [accessToken, idToken, refreshToken, expiresAtRaw] = await Promise.all([
    SecureStore.getItemAsync(STORAGE_KEYS.authAccessToken),
    SecureStore.getItemAsync(STORAGE_KEYS.authIdToken),
    SecureStore.getItemAsync(STORAGE_KEYS.authRefreshToken),
    SecureStore.getItemAsync(STORAGE_KEYS.authExpiresAt),
  ]);

  const expiresAt = expiresAtRaw ? Number(expiresAtRaw) : NaN;

  if (!accessToken || !idToken || !refreshToken || Number.isNaN(expiresAt)) {
    return null;
  }

  return { accessToken, idToken, refreshToken, expiresAt };
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(STORAGE_KEYS.authAccessToken);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(STORAGE_KEYS.authAccessToken),
    SecureStore.deleteItemAsync(STORAGE_KEYS.authIdToken),
    SecureStore.deleteItemAsync(STORAGE_KEYS.authRefreshToken),
    SecureStore.deleteItemAsync(STORAGE_KEYS.authExpiresAt),
  ]);
}

export function isExpired(expiresAt: number, skewMs = 30_000): boolean {
  return Date.now() >= expiresAt - skewMs;
}

import AsyncStorage from '@react-native-async-storage/async-storage';

import { REQUEST_TIMEOUT_MS, STORAGE_KEYS } from '@/constants/config';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let cachedBaseUrl: string | undefined;

function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed || /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  // Accept "10.0.0.5:8080" as shorthand for "http://10.0.0.5:8080" — fetch()
  // requires a full URL with a scheme, and typing the scheme is easy to forget.
  return `http://${trimmed}`;
}

export async function getApiBaseUrl(): Promise<string> {
  if (cachedBaseUrl !== undefined) return cachedBaseUrl;
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.apiBaseUrl);
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
  cachedBaseUrl = normalizeBaseUrl(stored || fromEnv);
  return cachedBaseUrl;
}

export async function setApiBaseUrl(url: string): Promise<void> {
  const trimmed = normalizeBaseUrl(url);
  if (!trimmed) {
    throw new Error('Adres serwera nie może być pusty.');
  }
  cachedBaseUrl = trimmed;
  await AsyncStorage.setItem(STORAGE_KEYS.apiBaseUrl, trimmed);
}

type ErrorBody = {
  message?: string;
  fieldErrors?: Record<string, string>;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = await getApiBaseUrl();
  if (!baseUrl) {
    throw new ApiError(0, 'Adres serwera API nie jest skonfigurowany.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...init?.headers,
      },
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(0, 'Serwer nie odpowiada. Sprawdź adres API i połączenie sieciowe.');
    }
    const detail = error instanceof Error ? error.message : String(error);
    throw new ApiError(0, `Nie udało się połączyć z serwerem (${detail}). Adres: ${baseUrl}${path}`);
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const errorBody = (body ?? {}) as ErrorBody;
    const message =
      errorBody.message ??
      (errorBody.fieldErrors
        ? Object.entries(errorBody.fieldErrors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join('; ')
        : `Błąd serwera (${response.status})`);
    throw new ApiError(response.status, message);
  }

  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
};

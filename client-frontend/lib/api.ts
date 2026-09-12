import "server-only";

import { config } from "@/lib/config";
import type {
  ApiErrorBody,
  AuthTokens,
  CoinAddition,
  Company,
  MessageResponse,
  RegisterResponse,
  Service,
  Transaction,
  User,
} from "@/lib/types";

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(status: number, message: string, body: ApiErrorBody | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  accessToken?: string | null;
  cache?: RequestCache;
};

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: options.cache ?? "no-store",
  });

  const data = await parseBody(response);

  if (!response.ok) {
    const body = (data ?? null) as ApiErrorBody | null;
    const message =
      body?.message ||
      body?.error ||
      `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, body);
  }

  return data as T;
}

export function login(email: string, password: string) {
  return apiRequest<AuthTokens>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function register(payload: {
  email: string;
  password: string;
  name: string;
  surname: string;
  phoneNumber?: number;
  isOwner?: boolean;
}) {
  return apiRequest<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: {
      ...payload,
      isOwner: payload.isOwner ?? false,
    },
  });
}

export function confirmRegistration(email: string, confirmationCode: string) {
  return apiRequest<MessageResponse>("/api/auth/confirm", {
    method: "POST",
    body: { email, confirmationCode },
  });
}

export function resendConfirmationCode(email: string) {
  return apiRequest<MessageResponse>("/api/auth/resend-code", {
    method: "POST",
    body: { email },
  });
}

export function refreshTokens(refreshToken: string) {
  return apiRequest<AuthTokens>("/api/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  });
}

export function logout(accessToken: string) {
  return apiRequest<MessageResponse>("/api/auth/logout", {
    method: "POST",
    accessToken,
  });
}

export function getMe(accessToken: string) {
  return apiRequest<User>("/api/auth/me", { accessToken });
}

export function getUserTransactions(userId: number, accessToken: string) {
  return apiRequest<Transaction[]>(
    `/api/transactions?userId=${encodeURIComponent(String(userId))}`,
    { accessToken },
  );
}

export function getUserCoinAdditions(userId: number, accessToken: string) {
  return apiRequest<CoinAddition[]>(
    `/api/coin-additions?userId=${encodeURIComponent(String(userId))}`,
    { accessToken },
  );
}

/** GET /api/companies — optional ownerId filter */
export function listCompanies(accessToken?: string | null, ownerId?: number) {
  const query =
    ownerId != null ? `?ownerId=${encodeURIComponent(String(ownerId))}` : "";
  return apiRequest<Company[]>(`/api/companies${query}`, {
    accessToken: accessToken ?? undefined,
  });
}

/** GET /api/companies/{id} */
export function getCompany(id: number, accessToken?: string | null) {
  return apiRequest<Company>(`/api/companies/${id}`, {
    accessToken: accessToken ?? undefined,
  });
}

/** GET /api/services — optional providerId filter */
export function listServices(accessToken?: string | null, providerId?: number) {
  const query =
    providerId != null
      ? `?providerId=${encodeURIComponent(String(providerId))}`
      : "";
  return apiRequest<Service[]>(`/api/services${query}`, {
    accessToken: accessToken ?? undefined,
  });
}

/** POST /api/services */
export function createService(
  body: {
    name: string;
    coinCost: number;
    providerId?: number | null;
  },
  accessToken?: string | null,
) {
  return apiRequest<Service>("/api/services", {
    method: "POST",
    body,
    accessToken: accessToken ?? undefined,
  });
}

/** POST /api/transactions — spends coins for a discount voucher */
export function createTransaction(
  body: {
    userId?: number;
    phoneNumber?: number;
    serviceId: number;
    date?: string;
  },
  accessToken?: string | null,
) {
  return apiRequest<Transaction>("/api/transactions", {
    method: "POST",
    body,
    accessToken: accessToken ?? undefined,
  });
}

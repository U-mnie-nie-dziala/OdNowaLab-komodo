
import type {
  AuthResponseDto,
  CoinAdditionRequestDto,
  CoinAdditionResponseDto,
  CompanyRequestDto,
  CompanyResponseDto,
  ConfirmSignUpRequestDto,
  LoginRequestDto,
  MessageResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  ServiceRequestDto,
  ServiceResponseDto,
  ConsumeTransactionRequestDto,
  TransactionRequestDto,
  TransactionResponseDto,
  UserRequestDto,
  UserResponseDto,
} from "./types";

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;
  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Nie można połączyć się z serwerem. Sprawdź, czy backend działa.");
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const body = (data ?? {}) as {
      message?: string;
      error?: string;
      fieldErrors?: Record<string, string>;
    };
    const fieldMsg = body.fieldErrors
      ? Object.values(body.fieldErrors).join(" ")
      : undefined;
    const message =
      body.message || fieldMsg || body.error || `Błąd serwera (${res.status})`;
    throw new ApiError(res.status, message, body.fieldErrors);
  }

  return data as T;
}

// Zapytanie multipart (upload plików) — bez nagłówka JSON (boundary ustawia przeglądarka).
async function formRequest<T>(path: string, method: string, formData: FormData): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, { method, body: formData, cache: "no-store" });
  } catch {
    throw new ApiError(0, "Nie można połączyć się z serwerem. Sprawdź, czy backend działa.");
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const body = (data ?? {}) as { message?: string; error?: string };
    throw new ApiError(res.status, body.message || body.error || `Błąd serwera (${res.status})`);
  }
  return data as T;
}

export const authApi = {
  register: (body: RegisterRequestDto) =>
    request<RegisterResponseDto>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  confirm: (body: ConfirmSignUpRequestDto) =>
    request<MessageResponseDto>("/auth/confirm", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  resendCode: (email: string) =>
    request<MessageResponseDto>("/auth/resend-code", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  login: (body: LoginRequestDto) =>
    request<AuthResponseDto>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  logout: (accessToken: string) =>
    request<MessageResponseDto>("/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
};

export const usersApi = {
  list: () => request<UserResponseDto[]>("/users"),
  get: (id: number) => request<UserResponseDto>(`/users/${id}`),
  create: (body: UserRequestDto) =>
    request<UserResponseDto>("/users", { method: "POST", body: JSON.stringify(body) }),
  update: (id: number, body: UserRequestDto) =>
    request<UserResponseDto>(`/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
};

export const companiesApi = {
  list: () => request<CompanyResponseDto[]>("/companies"),
  byOwner: (ownerId: number) =>
    request<CompanyResponseDto[]>(`/companies?ownerId=${ownerId}`),
  get: (id: number) => request<CompanyResponseDto>(`/companies/${id}`),
  create: (body: CompanyRequestDto) =>
    request<CompanyResponseDto>("/companies", { method: "POST", body: JSON.stringify(body) }),
  update: (id: number, body: CompanyRequestDto) =>
    request<CompanyResponseDto>(`/companies/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  // Zdjęcie sklepu (JPG/PNG/GIF/WEBP)
  uploadImage: (id: number, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return formRequest<CompanyResponseDto>(`/companies/${id}/image`, "POST", fd);
  },
  updateImage: (id: number, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return formRequest<CompanyResponseDto>(`/companies/${id}/image`, "PUT", fd);
  },
  deleteImage: (id: number) =>
    request<void>(`/companies/${id}/image`, { method: "DELETE" }),
  imageUrl: (id: number) => `/api/companies/${id}/image`,
};

export const servicesApi = {
  list: () => request<ServiceResponseDto[]>("/services"),
  byProvider: (providerId: number) =>
    request<ServiceResponseDto[]>(`/services?providerId=${providerId}`),
  create: (body: ServiceRequestDto) =>
    request<ServiceResponseDto>("/services", { method: "POST", body: JSON.stringify(body) }),
  update: (id: number, body: ServiceRequestDto) =>
    request<ServiceResponseDto>(`/services/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id: number) => request<void>(`/services/${id}`, { method: "DELETE" }),
};

export const coinAdditionsApi = {
  byCompany: (companyId: number) =>
    request<CoinAdditionResponseDto[]>(`/coin-additions?companyId=${companyId}`),
  byUser: (userId: number) =>
    request<CoinAdditionResponseDto[]>(`/coin-additions?userId=${userId}`),
  create: (body: CoinAdditionRequestDto) =>
    request<CoinAdditionResponseDto>("/coin-additions", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export const transactionsApi = {
  byService: (serviceId: number) =>
    request<TransactionResponseDto[]>(`/transactions?serviceId=${serviceId}`),
  byUser: (userId: number) =>
    request<TransactionResponseDto[]>(`/transactions?userId=${userId}`),
  byProvider: (
    providerId: number,
    opts?: { userId?: number; isValid?: boolean; isConsumed?: boolean }
  ) => {
    const q = new URLSearchParams();
    if (opts?.userId != null) q.set("userId", String(opts.userId));
    if (opts?.isValid != null) q.set("isValid", String(opts.isValid));
    if (opts?.isConsumed != null) q.set("isConsumed", String(opts.isConsumed));
    const qs = q.toString();
    return request<TransactionResponseDto[]>(
      `/transactions/provider/${providerId}${qs ? `?${qs}` : ""}`
    );
  },
  byUserAndProvider: (
    userId: number,
    providerId: number,
    opts?: { isValid?: boolean; isConsumed?: boolean }
  ) => {
    const q = new URLSearchParams();
    if (opts?.isValid != null) q.set("isValid", String(opts.isValid));
    if (opts?.isConsumed != null) q.set("isConsumed", String(opts.isConsumed));
    const qs = q.toString();
    return request<TransactionResponseDto[]>(
      `/transactions/user/${userId}/provider/${providerId}${qs ? `?${qs}` : ""}`
    );
  },
  create: (body: TransactionRequestDto) =>
    request<TransactionResponseDto>("/transactions", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  consume: (id: number, providerId?: number) => {
    const qs =
      providerId != null ? `?providerId=${providerId}` : "";
    return request<TransactionResponseDto>(`/transactions/${id}/consume${qs}`, {
      method: "POST",
    });
  },
  consumeWithBody: (body: ConsumeTransactionRequestDto) =>
    request<TransactionResponseDto>("/transactions/consume", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

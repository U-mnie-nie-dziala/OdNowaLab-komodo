import { api } from '@/api/client';
import {
  AuthResponse,
  ConfirmRequest,
  LoginRequest,
  MessageResponse,
  RefreshRequest,
  RegisterRequest,
  RegisterResponse,
  ResendCodeRequest,
  UserDto,
} from '@/api/types';

export const authApi = {
  register: (body: RegisterRequest) => api.post<RegisterResponse>('/api/auth/register', body),
  confirm: (body: ConfirmRequest) => api.post<MessageResponse>('/api/auth/confirm', body),
  resendCode: (body: ResendCodeRequest) => api.post<MessageResponse>('/api/auth/resend-code', body),
  login: (body: LoginRequest) => api.post<AuthResponse>('/api/auth/login', body),
  refresh: (body: RefreshRequest) => api.post<AuthResponse>('/api/auth/refresh', body),
  me: () => api.get<UserDto>('/api/auth/me'),
  logout: () => api.post<MessageResponse>('/api/auth/logout'),
};

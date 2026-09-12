import { api } from '@/api/client';
import { UserDto, UserRequest } from '@/api/types';

export const usersApi = {
  getAll: () => api.get<UserDto[]>('/api/users'),
  getById: (id: number) => api.get<UserDto>(`/api/users/${id}`),
  create: (body: UserRequest) => api.post<UserDto>('/api/users', body),
  update: (id: number, body: UserRequest) => api.put<UserDto>(`/api/users/${id}`, body),
};

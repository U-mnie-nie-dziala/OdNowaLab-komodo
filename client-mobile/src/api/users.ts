import { ApiError } from '@/api/client';
import { allocateUserId, mockDelay, mockUsers } from '@/api/mock-store';
import { UserDto, UserRequest } from '@/api/types';

export const usersApi = {
  getAll: () => mockDelay([...mockUsers]),

  getById: (id: number) => {
    const user = mockUsers.find((u) => u.id === id);
    if (!user) return Promise.reject(new ApiError(404, `Nie znaleziono użytkownika o id ${id}`));
    return mockDelay(user);
  },

  create: (body: UserRequest) => {
    const user: UserDto = { id: allocateUserId(), ...body };
    mockUsers.push(user);
    return mockDelay(user);
  },

  update: (id: number, body: UserRequest) => {
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) return Promise.reject(new ApiError(404, `Nie znaleziono użytkownika o id ${id}`));
    const updated: UserDto = { id, ...body };
    mockUsers[index] = updated;
    return mockDelay(updated);
  },
};

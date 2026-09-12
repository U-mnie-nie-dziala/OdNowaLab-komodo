import { ApiError } from '@/api/client';
import { mockDelay, mockServices } from '@/api/mock-store';

export const servicesApi = {
  getAll: () => mockDelay([...mockServices]),

  getById: (id: number) => {
    const service = mockServices.find((s) => s.id === id);
    if (!service) return Promise.reject(new ApiError(404, `Nie znaleziono oferty o id ${id}`));
    return mockDelay(service);
  },
};

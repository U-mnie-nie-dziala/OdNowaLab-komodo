import { ApiError } from '@/api/client';
import { mockCompanies, mockDelay } from '@/api/mock-store';

export const companiesApi = {
  getAll: () => mockDelay([...mockCompanies]),

  getById: (id: number) => {
    const company = mockCompanies.find((c) => c.id === id);
    if (!company) return Promise.reject(new ApiError(404, `Nie znaleziono firmy o id ${id}`));
    return mockDelay(company);
  },
};

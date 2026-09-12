import { api } from '@/api/client';
import { CompanyDto } from '@/api/types';

export const companiesApi = {
  getAll: () => api.get<CompanyDto[]>('/api/companies'),
  getById: (id: number) => api.get<CompanyDto>(`/api/companies/${id}`),
};

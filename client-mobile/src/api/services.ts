import { api } from '@/api/client';
import { ServiceDto } from '@/api/types';

export const servicesApi = {
  getAll: () => api.get<ServiceDto[]>('/api/services'),
  getById: (id: number) => api.get<ServiceDto>(`/api/services/${id}`),
};

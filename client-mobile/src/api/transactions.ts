import { api } from '@/api/client';
import { TransactionDto, TransactionRequest } from '@/api/types';

export const transactionsApi = {
  getByUserId: (userId: number) => api.get<TransactionDto[]>(`/api/transactions?userId=${userId}`),
  create: (body: TransactionRequest) => api.post<TransactionDto>('/api/transactions', body),
};

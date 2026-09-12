import { api } from '@/api/client';
import { CoinAdditionDto } from '@/api/types';

export const coinAdditionsApi = {
  getByUserId: (userId: number) => api.get<CoinAdditionDto[]>(`/api/coin-additions?userId=${userId}`),
};

import { mockCoinAdditions, mockDelay } from '@/api/mock-store';

export const coinAdditionsApi = {
  getByUserId: (userId: number) => mockDelay(mockCoinAdditions.filter((c) => c.userId === userId)),
};

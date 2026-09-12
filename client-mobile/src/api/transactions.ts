import { allocateTransactionId, mockDelay, mockTransactions } from '@/api/mock-store';
import { TransactionDto, TransactionRequest } from '@/api/types';

export const transactionsApi = {
  getByUserId: (userId: number) => mockDelay(mockTransactions.filter((t) => t.userId === userId)),

  create: (body: TransactionRequest) => {
    const transaction: TransactionDto = { id: allocateTransactionId(), ...body };
    mockTransactions.push(transaction);
    return mockDelay(transaction);
  },
};

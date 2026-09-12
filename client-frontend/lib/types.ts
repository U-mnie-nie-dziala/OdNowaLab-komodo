export type User = {
  id: number;
  email: string;
  cognitoSub: string;
  cognitoUsername: string;
  name: string;
  coins: number;
  surname: string;
  phoneNumber: number | null;
  isPhoneVerified: boolean;
  isDeleted: boolean;
  isOwner: boolean;
};

export type AuthTokens = {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: User;
};

export type RegisterResponse = {
  message: string;
  userSub: string;
  email: string;
  isConfirmed: boolean;
  user: User;
};

export type MessageResponse = {
  message: string;
  success: boolean;
};

export type Transaction = {
  id: number;
  userId: number;
  serviceId: number;
  providerId: number;
  providerName: string;
  serviceName: string;
  coinCost: number;
  isValid: boolean;
  isConsumed: boolean;
  date: string;
};

export type CoinAddition = {
  id: number;
  userId: number;
  companyId: number;
  coinAmount: number;
  date: string;
};

export type ApiErrorBody = {
  message?: string;
  error?: string;
  status?: number;
};

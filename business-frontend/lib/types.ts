
export interface UserResponseDto {
  id: number;
  email: string | null;
  cognitoSub: string | null;
  cognitoUsername: string | null;
  name: string;
  coins: number;
  surname: string;
  phoneNumber: number;
  isDeleted: boolean;
  isOwner: boolean;
}

export interface UserRequestDto {
  email?: string;
  name: string;
  surname: string;
  coins: number;
  phoneNumber: number;
  isOwner?: boolean;
  isDeleted?: boolean;
}

export interface CompanyResponseDto {
  id: number;
  name: string;
  locationX: number;
  locationY: number;
  description: string;
  ownerId: number;
  isInRevitalizationZone: boolean;
  picture: string | null;
}

export interface CompanyRequestDto {
  name: string;
  locationX: number;
  locationY: number;
  description: string;
  ownerId: number;
  isInRevitalizationZone?: boolean;
  picture?: string | null;
}

export interface ServiceResponseDto {
  id: number;
  name: string;
  coinCost: number;
  providerId: number | null;
}

export interface ServiceRequestDto {
  name: string;
  coinCost: number;
  providerId?: number | null;
}

export interface CoinAdditionResponseDto {
  id: number;
  userId: number;
  companyId: number;
  coinAmount: number;
  date: string;
}

export interface CoinAdditionRequestDto {
  userId: number;
  companyId: number;
  coinAmount: number;
  date: string;
}

export interface TransactionResponseDto {
  id: number;
  userId: number;
  serviceId: number;
  providerId: number | null;
  providerName: string | null;
  serviceName: string;
  coinCost: number;
  isValid: boolean;
  isConsumed: boolean;
  date: string;
}

export interface TransactionRequestDto {
  userId?: number;
  phoneNumber?: number;
  serviceId: number;
  date?: string;
}

export interface ConsumeTransactionRequestDto {
  transactionId: number;
  providerId?: number;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
  name: string;
  surname: string;
  phoneNumber: number;
  isOwner?: boolean;
}

export interface RegisterResponseDto {
  message: string;
  userSub: string;
  email: string;
  isConfirmed: boolean;
  user: UserResponseDto;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: UserResponseDto;
}

export interface ConfirmSignUpRequestDto {
  email: string;
  confirmationCode: string;
}

export interface MessageResponseDto {
  message: string;
  success: boolean;
}

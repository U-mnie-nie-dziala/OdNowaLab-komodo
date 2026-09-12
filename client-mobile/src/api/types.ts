export interface UserDto {
  id: number;
  email: string | null;
  cognitoSub: string | null;
  cognitoUsername: string | null;
  name: string;
  surname: string;
  coins: number;
  phoneNumber: number | null;
  isPhoneVerified: boolean;
  isDeleted: boolean;
  isOwner: boolean;
}

export interface UserRequest {
  email?: string | null;
  cognitoSub?: string | null;
  cognitoUsername?: string | null;
  name: string;
  surname: string;
  coins: number;
  phoneNumber: number | null;
  isDeleted: boolean;
  isOwner: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  surname: string;
  phoneNumber?: number;
  isOwner?: boolean;
}

export interface RegisterResponse {
  message: string;
  userSub: string;
  email: string;
  isConfirmed: boolean;
  user: UserDto;
}

export interface ConfirmRequest {
  email: string;
  confirmationCode: string;
}

export interface ResendCodeRequest {
  email: string;
}

export interface MessageResponse {
  message: string;
  success?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user?: UserDto | null;
}

export interface CompanyDto {
  id: number;
  name: string;
  locationX: number;
  locationY: number;
  description: string;
  ownerId: number;
  isInRevitalizationZone: boolean;
  picture: string | null;
}

export interface CompanyRequest {
  name: string;
  locationX: number;
  locationY: number;
  description: string;
  ownerId: number;
  isInRevitalizationZone: boolean;
  picture?: string | null;
}

export interface ServiceDto {
  id: number;
  name: string;
  coinCost: number;
  providerId: number | null;
}

export interface ServiceRequest {
  name: string;
  coinCost: number;
  providerId: number | null;
}

export interface TransactionDto {
  id: number;
  userId: number;
  serviceId: number;
  date: string;
}

export interface TransactionRequest {
  userId: number;
  serviceId: number;
  date: string;
}

export interface CoinAdditionDto {
  id: number;
  userId: number;
  companyId: number;
  coinAmount: number;
  date: string;
}

export interface CoinAdditionRequest {
  userId: number;
  companyId: number;
  coinAmount: number;
  date: string;
}

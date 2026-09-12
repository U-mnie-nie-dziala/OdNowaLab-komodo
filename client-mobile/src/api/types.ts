export interface UserDto {
  id: number;
  email: string | null;
  cognitoSub: string | null;
  cognitoUsername: string | null;
  name: string;
  surname: string;
  coins: number;
  phoneNumber: number;
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
  phoneNumber: number;
  isDeleted: boolean;
  isOwner: boolean;
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

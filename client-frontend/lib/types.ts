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
  providerId: number | null;
  providerName: string | null;
  serviceName: string;
  coinCost: number;
  isValid: boolean;
  isConsumed: boolean;
  date: string;
};

export type Service = {
  id: number;
  name: string;
  coinCost: number;
  providerId: number | null;
};

export type CoinAddition = {
  id: number;
  userId: number;
  companyId: number;
  coinAmount: number;
  date: string;
};

/** CompanyResponseDto from GET /api/companies */
export type Company = {
  id: number;
  name: string;
  /** Latitude (API sample: 52.23 ≈ Wołomin) */
  locationX: number;
  /** Longitude (API sample: 21.01) */
  locationY: number;
  description: string;
  ownerId: number;
  isInRevitalizationZone: boolean;
  /** Relative path or null; prefer GET /api/companies/{id}/image */
  picture: string | null;
};

/** Normalized marker ready for a future map library */
export type PartnerMapMarker = {
  id: number;
  name: string;
  description: string;
  lat: number;
  lng: number;
  isInRevitalizationZone: boolean;
  imageUrl: string | null;
};

export type ApiErrorBody = {
  message?: string;
  error?: string;
  status?: number;
};

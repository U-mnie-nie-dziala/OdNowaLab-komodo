import { CoinAdditionDto, CompanyDto, ServiceDto, TransactionDto, UserDto } from '@/api/types';

/**
 * In-memory mock backend. There is no real API connection right now — this
 * stands in for it until the app talks to a real backend again (planned via
 * Cognito-backed auth). Data resets whenever the app process restarts.
 */

const MOCK_LATENCY_MS = 250;

export function mockDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_LATENCY_MS));
}

export const DEFAULT_MOCK_USER_ID = 1;

export const mockUsers: UserDto[] = [
  { id: 1, name: 'Jan', surname: 'Kowalski', coins: 250, phoneNumber: 501111222, isDeleted: false, isOwner: true },
  { id: 2, name: 'Anna', surname: 'Nowak', coins: 300, phoneNumber: 502222333, isDeleted: false, isOwner: true },
  { id: 3, name: 'Piotr', surname: 'Wiśniewski', coins: 150, phoneNumber: 503333444, isDeleted: false, isOwner: true },
  { id: 4, name: 'Maria', surname: 'Zielińska', coins: 120, phoneNumber: 601111222, isDeleted: false, isOwner: false },
  { id: 5, name: 'Tomasz', surname: 'Lewandowski', coins: 85, phoneNumber: 602222333, isDeleted: false, isOwner: false },
  { id: 6, name: 'Zofia', surname: 'Dąbrowska', coins: 60, phoneNumber: 603333444, isDeleted: false, isOwner: false },
];

export const mockCompanies: CompanyDto[] = [
  {
    id: 1,
    name: 'EkoPiekarnia',
    locationX: 52.23,
    locationY: 21.01,
    description: 'Tradycyjna piekarnia z pieczywem na zakwasie z lokalnych mąk.',
    ownerId: 1,
    isInRevitalizationZone: true,
  },
  {
    id: 2,
    name: 'Kawiarnia Retro',
    locationX: 52.24,
    locationY: 21.02,
    description: 'Klimatyczna kawiarnia w sercu zrewitalizowanej kamienicy.',
    ownerId: 2,
    isInRevitalizationZone: true,
  },
  {
    id: 3,
    name: 'Rowerowy Warsztat',
    locationX: 52.22,
    locationY: 21.0,
    description: 'Serwis, naprawa oraz wypożyczalnia rowerów miejskich.',
    ownerId: 3,
    isInRevitalizationZone: false,
  },
  {
    id: 4,
    name: 'Zielarnia OdNowa',
    locationX: 52.25,
    locationY: 21.03,
    description: 'Naturalne zioła, miody z miejskich pasiek i kosmetyki ekologiczne.',
    ownerId: 2,
    isInRevitalizationZone: true,
  },
];

export const mockServices: ServiceDto[] = [
  { id: 1, name: 'Kawa espresso', coinCost: 10, providerId: 2 },
  { id: 2, name: 'Ciastko domowe', coinCost: 15, providerId: 2 },
  { id: 3, name: 'Chleb żytni', coinCost: 12, providerId: 1 },
  { id: 4, name: 'Drożdżówka', coinCost: 6, providerId: 1 },
  { id: 5, name: 'Przegląd roweru', coinCost: 50, providerId: 3 },
  { id: 6, name: 'Regulacja hamulców', coinCost: 20, providerId: 3 },
  { id: 7, name: 'Herbata ziołowa', coinCost: 8, providerId: 4 },
  { id: 8, name: 'Bilet do teatru', coinCost: 40, providerId: null },
];

export const mockCoinAdditions: CoinAdditionDto[] = [
  { id: 1, userId: 1, companyId: 1, coinAmount: 40, date: '2026-08-20' },
  { id: 2, userId: 1, companyId: 2, coinAmount: 60, date: '2026-09-01' },
];

export const mockTransactions: TransactionDto[] = [
  { id: 1, userId: 1, serviceId: 3, date: '2026-08-25' },
];

let userIdCounter = mockUsers.length;
export function allocateUserId(): number {
  userIdCounter += 1;
  return userIdCounter;
}

let transactionIdCounter = mockTransactions.length;
export function allocateTransactionId(): number {
  transactionIdCounter += 1;
  return transactionIdCounter;
}

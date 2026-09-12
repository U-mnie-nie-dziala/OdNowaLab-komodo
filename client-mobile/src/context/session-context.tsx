import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { ApiError, getApiBaseUrl } from '@/api/client';
import { usersApi } from '@/api/users';
import { UserDto } from '@/api/types';
import { DEFAULT_DEMO_USER_ID, STORAGE_KEYS } from '@/constants/config';

type SessionState = {
  isLoading: boolean;
  user: UserDto | null;
  error: string | null;
  apiBaseUrl: string;
  hasResidentCard: boolean;
  refreshUser: () => Promise<void>;
  updateUser: (patch: Partial<Pick<UserDto, 'name' | 'surname' | 'phoneNumber'>>) => Promise<void>;
  setHasResidentCard: (value: boolean) => Promise<void>;
  retryBootstrap: () => Promise<void>;
};

const SessionContext = createContext<SessionState | undefined>(undefined);

/**
 * TEMPORARY: there is no login/auth yet — real auth is coming via Cognito.
 * This bootstraps a fixed demo user from the backend's seed data. Replace
 * with a real Cognito session (decode the id token, look up the matching
 * backend user) once auth lands.
 */
async function bootstrapUser(): Promise<UserDto> {
  const storedUserId = await AsyncStorage.getItem(STORAGE_KEYS.sessionUserId);
  const id = storedUserId ? Number(storedUserId) : DEFAULT_DEMO_USER_ID;

  try {
    const user = await usersApi.getById(id);
    await AsyncStorage.setItem(STORAGE_KEYS.sessionUserId, String(user.id));
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404 && id !== DEFAULT_DEMO_USER_ID) {
      const fallback = await usersApi.getById(DEFAULT_DEMO_USER_ID);
      await AsyncStorage.setItem(STORAGE_KEYS.sessionUserId, String(fallback.id));
      return fallback;
    }
    throw error;
  }
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiBaseUrl, setApiBaseUrlState] = useState('');
  const [hasResidentCard, setHasResidentCardState] = useState(false);

  const runBootstrap = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setApiBaseUrlState(await getApiBaseUrl());
    try {
      setUser(await bootstrapUser());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Nieznany błąd połączenia.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const storedResidentCard = await AsyncStorage.getItem(STORAGE_KEYS.hasResidentCard);
      setHasResidentCardState(storedResidentCard === 'true');
      await runBootstrap();
    })();
  }, [runBootstrap]);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    const refreshed = await usersApi.getById(user.id);
    setUser(refreshed);
  }, [user]);

  const updateUser = useCallback(
    async (patch: Partial<Pick<UserDto, 'name' | 'surname' | 'phoneNumber'>>) => {
      if (!user) return;
      const updated = await usersApi.update(user.id, {
        email: user.email,
        cognitoSub: user.cognitoSub,
        cognitoUsername: user.cognitoUsername,
        name: patch.name ?? user.name,
        surname: patch.surname ?? user.surname,
        phoneNumber: patch.phoneNumber ?? user.phoneNumber,
        coins: user.coins,
        isDeleted: user.isDeleted,
        isOwner: user.isOwner,
      });
      setUser(updated);
    },
    [user]
  );

  const setHasResidentCard = useCallback(async (value: boolean) => {
    await AsyncStorage.setItem(STORAGE_KEYS.hasResidentCard, String(value));
    setHasResidentCardState(value);
  }, []);

  const value = useMemo<SessionState>(
    () => ({
      isLoading,
      user,
      error,
      apiBaseUrl,
      hasResidentCard,
      refreshUser,
      updateUser,
      setHasResidentCard,
      retryBootstrap: runBootstrap,
    }),
    [
      isLoading,
      user,
      error,
      apiBaseUrl,
      hasResidentCard,
      refreshUser,
      updateUser,
      setHasResidentCard,
      runBootstrap,
    ]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

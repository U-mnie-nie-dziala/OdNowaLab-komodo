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

import { authApi } from '@/api/auth';
import { clearTokens, getAccessToken, getTokens, isExpired, saveTokens } from '@/api/auth-storage';
import { ApiError, getApiBaseUrl, setAuthTokenGetter, setUnauthorizedHandler } from '@/api/client';
import { usersApi } from '@/api/users';
import { RegisterRequest, RegisterResponse, UserDto } from '@/api/types';
import { STORAGE_KEYS } from '@/constants/config';

type SessionState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserDto | null;
  error: string | null;
  apiBaseUrl: string;
  hasResidentCard: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (body: RegisterRequest) => Promise<RegisterResponse>;
  confirmRegistration: (email: string, confirmationCode: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (patch: Partial<Pick<UserDto, 'name' | 'surname' | 'phoneNumber'>>) => Promise<void>;
  setHasResidentCard: (value: boolean) => Promise<void>;
  retryBootstrap: () => Promise<void>;
};

const SessionContext = createContext<SessionState | undefined>(undefined);

setAuthTokenGetter(getAccessToken);

async function tryRefresh(refreshToken: string): Promise<string | null> {
  try {
    const refreshed = await authApi.refresh({ refreshToken });
    await saveTokens(refreshed);
    return refreshed.accessToken;
  } catch {
    return null;
  }
}

async function restoreSession(): Promise<UserDto | null> {
  const tokens = await getTokens();
  if (!tokens) return null;

  if (isExpired(tokens.expiresAt)) {
    const newAccessToken = await tryRefresh(tokens.refreshToken);
    if (!newAccessToken) {
      await clearTokens();
      return null;
    }
  }

  try {
    return await authApi.me();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      const newAccessToken = await tryRefresh(tokens.refreshToken);
      if (newAccessToken) {
        try {
          return await authApi.me();
        } catch {
          await clearTokens();
          return null;
        }
      }
      await clearTokens();
      return null;
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

  const handleUnauthorized = useCallback(async () => {
    const tokens = await getTokens();
    if (!tokens) return null;
    const newAccessToken = await tryRefresh(tokens.refreshToken);
    if (!newAccessToken) {
      await clearTokens();
      setUser(null);
    }
    return newAccessToken;
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized);
  }, [handleUnauthorized]);

  const runBootstrap = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setApiBaseUrlState(await getApiBaseUrl());
    try {
      setUser(await restoreSession());
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

  const login = useCallback(async (email: string, password: string) => {
    const resp = await authApi.login({ email, password });
    await saveTokens(resp);
    setUser(resp.user ?? null);
  }, []);

  const register = useCallback(
    (body: RegisterRequest) => authApi.register({ ...body, isOwner: false }),
    []
  );

  const confirmRegistration = useCallback(async (email: string, confirmationCode: string) => {
    await authApi.confirm({ email, confirmationCode });
  }, []);

  const resendCode = useCallback(async (email: string) => {
    await authApi.resendCode({ email });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Best-effort server-side sign-out — local logout must always succeed.
    }
    await clearTokens();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    setUser(await authApi.me());
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
      isAuthenticated: user !== null,
      user,
      error,
      apiBaseUrl,
      hasResidentCard,
      login,
      register,
      confirmRegistration,
      resendCode,
      logout,
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
      login,
      register,
      confirmRegistration,
      resendCode,
      logout,
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

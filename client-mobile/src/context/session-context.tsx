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

import { DEFAULT_MOCK_USER_ID } from '@/api/mock-store';
import { usersApi } from '@/api/users';
import { UserDto } from '@/api/types';
import { STORAGE_KEYS } from '@/constants/config';

type SessionState = {
  isLoading: boolean;
  user: UserDto | null;
  hasResidentCard: boolean;
  refreshUser: () => Promise<void>;
  updateUser: (patch: Partial<Pick<UserDto, 'name' | 'surname' | 'phoneNumber'>>) => Promise<void>;
  adjustCoins: (delta: number) => Promise<void>;
  setHasResidentCard: (value: boolean) => Promise<void>;
};

const SessionContext = createContext<SessionState | undefined>(undefined);

/**
 * TEMPORARY: there is no real backend connection right now (mocked locally
 * in api/mock-store.ts) and no login/auth — real auth is coming via Cognito.
 * This just picks a demo user to act as. Replace with a real Cognito session
 * (decode the id token, look up/create the matching backend user) once auth
 * and the real API are wired back up.
 */
async function bootstrapUser(): Promise<UserDto> {
  const storedUserId = await AsyncStorage.getItem(STORAGE_KEYS.sessionUserId);
  const id = storedUserId ? Number(storedUserId) : DEFAULT_MOCK_USER_ID;

  const user = await usersApi.getById(id).catch(() => usersApi.getById(DEFAULT_MOCK_USER_ID));
  await AsyncStorage.setItem(STORAGE_KEYS.sessionUserId, String(user.id));
  return user;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserDto | null>(null);
  const [hasResidentCard, setHasResidentCardState] = useState(false);

  useEffect(() => {
    (async () => {
      const storedResidentCard = await AsyncStorage.getItem(STORAGE_KEYS.hasResidentCard);
      setHasResidentCardState(storedResidentCard === 'true');
      setUser(await bootstrapUser());
      setIsLoading(false);
    })();
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    const refreshed = await usersApi.getById(user.id);
    setUser(refreshed);
  }, [user]);

  const updateUser = useCallback(
    async (patch: Partial<Pick<UserDto, 'name' | 'surname' | 'phoneNumber'>>) => {
      if (!user) return;
      const updated = await usersApi.update(user.id, {
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

  const adjustCoins = useCallback(
    async (delta: number) => {
      if (!user) return;
      const updated = await usersApi.update(user.id, {
        name: user.name,
        surname: user.surname,
        phoneNumber: user.phoneNumber,
        coins: user.coins + delta,
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
      hasResidentCard,
      refreshUser,
      updateUser,
      adjustCoins,
      setHasResidentCard,
    }),
    [isLoading, user, hasResidentCard, refreshUser, updateUser, adjustCoins, setHasResidentCard]
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

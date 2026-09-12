"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi, companiesApi, ApiError } from "./api";

const SESSION_KEY = "wl_session";
const META_KEY = "wl_meta";

export interface Session {
  email: string;
  userId: number;
  ownerName: string;
  companyId: number;
  companyName: string;
  accessToken: string;
  idToken: string;
  refreshToken: string;
  nip?: string;
  address?: string;
}

export interface RegisterInput {
  name: string;
  surname: string;
  email: string;
  phoneNumber: number;
  password: string;
  companyName: string;
  nip: string;
  address: string;
  description: string;
  locationX: number;
  locationY: number;
  isInRevitalizationZone: boolean;
}

interface BusinessMeta {
  nip?: string;
  address?: string;
}

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Session>;
  register: (input: RegisterInput) => Promise<{ isConfirmed: boolean; email: string }>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readMeta(): Record<string, BusinessMeta> {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? (JSON.parse(raw) as Record<string, BusinessMeta>) : {};
  } catch {
    return {};
  }
}

function saveMeta(email: string, meta: BusinessMeta) {
  try {
    const all = readMeta();
    all[email.toLowerCase()] = meta;
    localStorage.setItem(META_KEY, JSON.stringify(all));
  } catch {
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setSession(JSON.parse(raw) as Session);
    } catch {
    }
    setLoading(false);
  }, []);

  const persistSession = useCallback((s: Session | null) => {
    setSession(s);
    try {
      if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      else localStorage.removeItem(SESSION_KEY);
    } catch {
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<Session> => {
      const key = email.trim().toLowerCase();
      if (!key || !password) throw new Error("Podaj e-mail i hasło.");

      const auth = await authApi.login({ email: key, password });
      const user = auth.user;

      if (!user.isOwner) {
        throw new Error("To konto nie jest kontem właściciela sklepu.");
      }

      const companies = await companiesApi.byOwner(user.id);
      const company = companies[0];
      if (!company) {
        throw new Error(
          "To konto właściciela nie ma jeszcze przypisanego sklepu."
        );
      }

      const meta = readMeta()[key] ?? {};
      const s: Session = {
        email: key,
        userId: user.id,
        ownerName: `${user.name} ${user.surname}`,
        companyId: company.id,
        companyName: company.name,
        accessToken: auth.accessToken,
        idToken: auth.idToken,
        refreshToken: auth.refreshToken,
        nip: meta.nip,
        address: meta.address,
      };
      persistSession(s);
      return s;
    },
    [persistSession]
  );

  const register = useCallback(
    async (input: RegisterInput): Promise<{ isConfirmed: boolean; email: string }> => {
      const email = input.email.trim();
      const resp = await authApi.register({
        email,
        password: input.password,
        name: input.name,
        surname: input.surname,
        phoneNumber: input.phoneNumber,
        isOwner: true,
      });

      await companiesApi.create({
        name: input.companyName,
        locationX: input.locationX,
        locationY: input.locationY,
        description: input.description,
        ownerId: resp.user.id,
        isInRevitalizationZone: input.isInRevitalizationZone,
        picture: null,
      });

      saveMeta(email, { nip: input.nip, address: input.address });

      return { isConfirmed: Boolean(resp.isConfirmed), email };
    },
    []
  );

  const confirmSignUp = useCallback(async (email: string, code: string) => {
    await authApi.confirm({ email: email.trim(), confirmationCode: code.trim() });
  }, []);

  const resendCode = useCallback(async (email: string) => {
    await authApi.resendCode(email.trim());
  }, []);

  const logout = useCallback(() => {
    const token = session?.accessToken;
    persistSession(null);
    if (token) {
      authApi.logout(token).catch(() => {});
    }
  }, [session, persistSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ session, loading, login, register, confirmSignUp, resendCode, logout }),
    [session, loading, login, register, confirmSignUp, resendCode, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth musi być użyte wewnątrz <AuthProvider>.");
  return ctx;
}

export { ApiError };
